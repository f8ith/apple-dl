import asyncio
from collections import deque
from dataclasses import dataclass
from enum import Enum
import itertools
from pathlib import Path
from typing import Deque

import discord
from discord import Member, Guild, VoiceClient
from discord.ext import commands

from apple_dl import cfg
from apple_dl.discord_bot.utils import send_public
from apple_dl.jobs import GamdlJob
from apple_dl.routes.websocket import player_state_changed
from apple_dl.utils import truncated_uuid4


class DiscordPlayerModes(str, Enum):
    normal = "normal"
    repeat = "repeat"
    loop = "loop"


class Song:
    id_iter = itertools.count()

    def __init__(self, gamdl_job: GamdlJob):
        # TODO: Handle albums, playlists etc.
        self.id = next(self.id_iter)
        self.gamdl_job = gamdl_job
        assert self.gamdl_job.output_path

        if gamdl_job.url_type == "song":
            # TODO: other file formats
            self.filepath = (
                self.gamdl_job.output_path
                / Path(self.gamdl_job.artist_name)
                / Path(self.gamdl_job.album_name)
                / Path(f"{self.gamdl_job.track_number:02} " + self.gamdl_job.name)
            ).with_suffix(".m4a")
        else:
            raise ValueError("Only songs allowed")

    def __json__(self):
        ret = self.gamdl_job.__json__()
        ret["job_id"] = ret["id"]
        ret["id"] = self.id
        return ret


@dataclass
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
        self.volume = 0.3
        self.voice_client = voice_client
        self.current_song: Song | None = None
        self.mode: DiscordPlayerModes = DiscordPlayerModes.normal


class DiscordPlayerManager:
    def __init__(self):
        self._guild_to_player: dict[int, DiscordPlayerState] = {}
        self._channel_to_player: dict[int, DiscordPlayerState] = {}

    def by_guild(self, id: int):
        return self._guild_to_player.get(id)

    def by_channel(self, id: int):
        return self._channel_to_player.get(id)

    def all_players(self):
        return self._guild_to_player.values()

    def register_player(self, player: DiscordPlayerState):
        self._guild_to_player[player.guild.id] = player
        self._channel_to_player[player.channel_id] = player

    async def connect_player(self, ctx: commands.Context) -> str:
        author: Member = ctx.author  # type: ignore

        if not author or not author.voice or not author.voice.channel:
            raise ValueError("author voice state invalid")

        voice_client = await author.voice.channel.connect()

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
        await asyncio.sleep(300)
        if not player.voice_client.is_playing() and not player.voice_client.is_paused():
            await self.disconnect_player(player)

    async def play_next_song(self, player: DiscordPlayerState, song: Song | None):
        """Plays next song."""
        if not song:
            player.current_song = None
            # TODO: Improve voice client timeout functionality
            await self.wait_timeout(player)
            return

        player.current_song = song

        if not song.gamdl_job.job_result:
            try:
                await asyncio.wait_for(song.gamdl_job.job_completed.wait(), 30)
            except asyncio.TimeoutError:
                await send_public(player.ctx, "timed out waiting for song to download")
                return

        # TODO: Add seeking
        player.voice_client.play(
            DiscordAudioSource(
                volume=player.volume, source=song.filepath.absolute().as_posix()
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

    def play_next(self, player: DiscordPlayerState, id: int):
        for song in player.queue:
            if song.id == id:
                player.queue.remove(song)
                player.queue.appendleft(song)

    def play_later(self, player: DiscordPlayerState, id: int):
        for song in player.queue:
            if song.id == id:
                player.queue.remove(song)
                player.queue.append(song)

    def skip(self, player: DiscordPlayerState):
        player.voice_client.stop()

    def repeat(self, player: DiscordPlayerState):
        player.voice_client.stop()

    def remove_song(self, player: DiscordPlayerState, id: int):
        for song in player.queue:
            if song.id == id:
                player.queue.remove(song)

    def enable_loop(self, player: DiscordPlayerState):
        if player.mode == DiscordPlayerModes.loop or not player.current_song:
            return
        player.mode = DiscordPlayerModes.loop
        self.add_song(player, player.current_song)

    def enable_repeat(self, player: DiscordPlayerState):
        if player.mode == DiscordPlayerModes.repeat or not player.current_song:
            return
        player.mode = DiscordPlayerModes.repeat

    async def play_pause(self, player: DiscordPlayerState):
        if player.voice_client.is_paused():
            player.voice_client.resume()
        else:
            player.voice_client.pause()
        return self.emit_state_update(player)

    async def resume(self, player: DiscordPlayerState):
        player.voice_client.resume()
        return self.emit_state_update(player)

    async def pause(self, player: DiscordPlayerState):
        player.voice_client.pause()
        return self.emit_state_update(player)

    @classmethod
    async def emit_state_update(cls, player: DiscordPlayerState):
        await player_state_changed(cls.get_player_state_json(player))

    @staticmethod
    def get_player_state_json(player: DiscordPlayerState):
        return {
            "guild_name": player.guild.name,
            "channel_name": player.voice_client.channel.name,
            "current_song": (
                player.current_song.__json__() if player.current_song else None
            ),
            "is_paused": player.voice_client.is_paused(),
            "volume": player.volume,
            "mode": player.mode,
            "owner_name": player.owner.name,
        }


class DiscordAudioSource(discord.FFmpegOpusAudio):
    def __init__(
        self,
        *args,
        pass_time: int = 0,
        volume: float = 1.0,
        before_options: str = "",
        options: str = "",
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.counter: int = 0
        self.pass_time = pass_time
        self.bitrate = 192
        self.before_options = before_options
        self.options = f'-filter:a "volume={volume}" ' + options

    def read(self) -> bytes:
        # add the time here
        self.counter += 20
        return super().read()

    # custom method to return the current play-time
    def check_time(self) -> float:
        return self.counter / 1000 + self.pass_time
