import asyncio
from collections import deque
import itertools
from typing import Deque

import discord
from discord import Member, Guild, VoiceClient
from discord.ext import commands
from gamdl.downloader import DownloadItem
from gamdl.interface import MediaType

from apple_dl.config import cfg
from apple_dl.routers.websocket import player_queue_changed, player_state_changed
from apple_dl.schemas.discord_schemas import PlayerStateSchema, SongSchema, DiscordPlayerModes
from apple_dl.utils import truncated_uuid4

class Song:
    id_iter = itertools.count()

    def __init__(self, job_result: DownloadItem):
        # TODO Handle albums, playlists etc.
        self.id = next(self.id_iter)

        self.album_name = job_result.media_metadata["attributes"].get("albumName")
        self.artist_name = job_result.media_metadata["attributes"].get("artistName")
        self.name = job_result.media_metadata["attributes"].get("name")
        self.lyrics = job_result.lyrics.unsynced if job_result.lyrics else ""
        self.synced_lyrics = job_result.lyrics.synced if job_result.lyrics else ""
        self.track_number = job_result.media_tags.track
        self.type = job_result.media_tags.media_type
        self.filepath = job_result.final_path
        self.length = job_result.media_metadata.get("attributes", {}).get("durationInMillis", 0)
        self.image = job_result.media_metadata["attributes"].get("artwork", {}).get("url", "")
        self.url = "" #TODO URL

        if not self.type in [MediaType.SONG]:
            raise ValueError("Only songs allowed")

    def get_embed(self):
        embed = discord.Embed(
            title=self.name, url=self.url, colour=discord.Colour(0xFF0000)
        )
        embed.set_thumbnail(url=self.image)
        #embed.set_author(name=f"{self.artist_nameauthor.name} {action}", icon_url=author.avatar_url)
        embed.add_field(name="Artist", value=self.artist_name, inline=True)
        embed.add_field(name="Album", value=self.album_name, inline=True)
        embed.add_field(name="Lyrics", value=self.lyrics if self.lyrics else "")
        return embed

    def __pydantic__(self):
        return SongSchema(
            id=self.id,
            album_name=self.album_name,
            artist_name=self.artist_name,
            name=self.name,
            url=self.url,
            image=self.image,
            length=self.length,
            lyrics=self.lyrics,
            synced_lyrics=self.synced_lyrics,
        )

class DiscordAudioSource(discord.FFmpegOpusAudio):
    def __init__(
        self,
        player: "DiscordPlayerState",
        bitrate: int = 128,
        seek_time: int = 0,
        before_options: str = "",
        options: str = "",
    ):
        self.player = player
        self.volume = player.volume
        self.counter: int = seek_time
        song = player.current_song
        
        if not song:
            raise ValueError("no song is playing")


        self.filepath = song.filepath

        if not self.filepath:
            raise ValueError("song gamdl job is not complete")

        before_options = f'-ss {self.counter / 1000} ' + before_options
        options = f'-filter:a "volume={player.volume}" ' + options
        super().__init__(source=self.filepath, before_options=before_options, options=options, bitrate=bitrate)

    def read(self) -> bytes:
        # add the time here
        self.counter += 20
        return super().read()

    def new_player(self, seek_time: int | None = None) -> "DiscordAudioSource":
        if not seek_time:
            seek_time = self.counter
        return DiscordAudioSource(player=self.player, seek_time=seek_time)

class DiscordPlayerState:
    def __init__(
        self,
        player_id: str,
        channel_id: int,
        voice_client: VoiceClient,
        ctx: commands.Context,
    ):
        self.player_id = player_id
        self.ctx = ctx
        self.owner: Member = ctx.author  # type: ignore
        self.channel_id = channel_id
        self.queue: Deque[Song] = deque()
        self.queue_capacity = cfg.DISCORD_QUEUE_CAPACITY
        self.guild: Guild = ctx.guild  # type: ignore
        self.volume = 0.2
        self.voice_client = voice_client
        self.current_song: Song | None = None
        self.mode: DiscordPlayerModes = DiscordPlayerModes.normal
        self.played: int = 0 
        self.song_length: int = 0

    def __pydantic__(self):
        return PlayerStateSchema(
            guild_name=self.guild.name,
            channel_name=self.voice_client.channel.name,
            current_song=self.current_song.__pydantic__() if self.current_song else None,
            is_paused=self.voice_client.is_paused(),
            volume=self.volume,
            mode=self.mode,
            owner_name=self.owner.name,
            song_length=self.current_song.length if self.current_song else None,
            song_played=self.voice_client.source.counter if (isinstance(self.voice_client.source, DiscordAudioSource)) else None,
        )


class DiscordPlayerManager:
    def __init__(self):
        self._guild_to_player: dict[int, DiscordPlayerState] = {}
        self._channel_to_player: dict[int, DiscordPlayerState] = {}
        self._id_to_player: dict[str, DiscordPlayerState] = {}

    def by_id(self, id: str):
        return self._id_to_player.get(id)

    def by_guild(self, id: int):
        return self._guild_to_player.get(id)

    def by_channel(self, id: int):
        return self._channel_to_player.get(id)

    def all_players(self):
        return self._id_to_player.values()

    def register_player(self, player: DiscordPlayerState):
        self._guild_to_player[player.guild.id] = player
        self._channel_to_player[player.channel_id] = player
        self._id_to_player[player.player_id] = player

    async def connect_player(self, ctx: commands.Context) -> str:
        author: Member = ctx.author  # type: ignore

        if not author or not author.voice or not author.voice.channel:
            raise ValueError("author voice state invalid")

        voice_client = await author.voice.channel.connect()

        player_id = truncated_uuid4()
        while self.by_id(player_id):
            player_id = truncated_uuid4()

        player = DiscordPlayerState(
            player_id, author.voice.channel.id, voice_client, ctx
        )
        self.register_player(player)

        return player_id

    async def disconnect_player(self, player: DiscordPlayerState):
        self.cleanup(player)
        await player.voice_client.disconnect()

    def cleanup(self, player: DiscordPlayerState):
        player.mode = DiscordPlayerModes.normal
        player.queue.clear()
        player.current_song = None

        del self._guild_to_player[player.guild.id]
        del self._channel_to_player[player.channel_id]
        del self._id_to_player[player.player_id]

    def next_song_info(self, player: DiscordPlayerState):
        if player.mode == "repeat":
            return player.current_song
        elif player.mode == "loop":
            song = player.queue.popleft()
            self.add_song(player, song)
            return song
        elif player.queue:
            return player.queue.popleft()
        else:
            return None

    async def wait_timeout(self, player: DiscordPlayerState):
        await asyncio.sleep(300.0)
        if not player.voice_client.is_playing() and not player.voice_client.is_paused():
            await self.disconnect_player(player)

    async def play_next_song(self, player: DiscordPlayerState, song: Song | None):
        # TODO Broken after no more songs in queue
        """Plays next song."""
        if not song:
            player.current_song = None
            await self.emit_state_update(player)
            #TODO Fix this broken shit
            #await self.wait_timeout(player)
            return

        player.current_song = song

        #if not song.gamdl_job.job_result:
        #    try:
        #        await asyncio.wait_for(song.gamdl_job.job_completed.wait(), 10)
        #    except asyncio.TimeoutError:
        #        await send_message(player.ctx, "timed out waiting for song to download")
        #        asyncio.create_task(self.play_next_song(player, self.next_song_info(player)))
        #        return

        #if isinstance(song.gamdl_job.job_result, Exception):
        #    await send_message(player.ctx, f"failed to download {song.name}")
        #    asyncio.create_task(self.play_next_song(player, self.next_song_info(player)))
        #    return

        #await send_embed(player.ctx, embed=song.get_embed())

        await self.emit_queue_update(player)
        await self.emit_state_update(player)

        player.voice_client.play(
            DiscordAudioSource(
                player=player
            ),
            after=lambda e: asyncio.run_coroutine_threadsafe(
                self.play_next_song(player, self.next_song_info(player)),
                player.ctx.bot.loop,
            ),
        )

    def add_song(self, player: DiscordPlayerState, song: Song, play_next: bool = False):
        if not player.current_song and len(player.queue) == 0:
            asyncio.run_coroutine_threadsafe(
                self.play_next_song(player, song), player.ctx.bot.loop
            )
        else:
            if play_next:
                player.queue.appendleft(song)
            else:
                player.queue.append(song)
            asyncio.run_coroutine_threadsafe(self.emit_queue_update(player), player.ctx.bot.loop)

    async def play_next(self, player: DiscordPlayerState, id: int):
        for song in player.queue:
            if song.id == id:
                player.queue.remove(song)
                player.queue.appendleft(song)
                await self.emit_queue_update(player)
                break

    async def play_later(self, player: DiscordPlayerState, id: int):
        for song in player.queue:
            if song.id == id:
                player.queue.remove(song)
                player.queue.append(song)
                await self.emit_queue_update(player)
                break

    async def skip(self, player: DiscordPlayerState):
        player.voice_client.stop()
        return

    async def remove_song(self, player: DiscordPlayerState, id: int):
        for song in player.queue:
            if song.id == id:
                player.queue.remove(song)
                await self.emit_queue_update(player)
                break

    async def enable_loop(self, player: DiscordPlayerState):
        if player.mode == DiscordPlayerModes.loop or not player.current_song:
            return
        player.mode = DiscordPlayerModes.loop
        self.add_song(player, player.current_song)
        await self.emit_queue_update(player)
        return await self.emit_state_update(player)

    async def enable_repeat(self, player: DiscordPlayerState):
        if player.mode == DiscordPlayerModes.repeat or not player.current_song:
            return
        player.mode = DiscordPlayerModes.repeat
        return await self.emit_state_update(player)

    async def play_pause(self, player: DiscordPlayerState):
        if player.voice_client.is_paused():
            player.voice_client.resume()
        else:
            player.voice_client.pause()
        return await self.emit_state_update(player)

    async def resume(self, player: DiscordPlayerState):
        player.voice_client.resume()
        return await self.emit_state_update(player)

    async def pause(self, player: DiscordPlayerState):
        player.voice_client.pause()
        return await self.emit_state_update(player)

    async def seek(self, player: DiscordPlayerState, seek_time: int):
        if player.voice_client.source:
            audio_source: DiscordAudioSource = player.voice_client.source #type: ignore
            player.voice_client.source = audio_source.new_player(seek_time)
        return await self.emit_state_update(player)

    async def set_volume(self, player: DiscordPlayerState, volume: float):
        # Limit volume to 0.5 prevent earrape

        volume = max(min(volume, 0.5), 0.0)
        player.volume = volume

        if player.current_song:
            audio_source: DiscordAudioSource = player.voice_client.source #type: ignore
            player.voice_client.source = audio_source.new_player()
        return await self.emit_state_update(player)

    @classmethod
    async def emit_state_update(cls, player: DiscordPlayerState):
        await player_state_changed(player.player_id, (player.__pydantic__().model_dump()))

    @classmethod
    async def emit_queue_update(cls, player: DiscordPlayerState):
        await player_queue_changed(player.player_id, [x.__pydantic__().model_dump() for x in player.queue])
