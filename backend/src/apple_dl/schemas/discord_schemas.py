from attr import define

from apple_dl.schemas.job_schemas import GamdlJobSchema
from apple_dl.discord_bot.player import DiscordPlayerModes, DiscordPlayerState, Song


@define
class SongSchema(GamdlJobSchema):
    job_id: int

    @classmethod
    def from_song(cls, song: "Song"):
        new_cls = cls(**GamdlJobSchema.from_job(song.gamdl_job).attributes)
        new_cls.job_id = new_cls.id
        new_cls.id = song.id
        return new_cls


@define
class PlayerStateSchema:
    guild_name: str
    channel_name: str
    current_song: SongSchema | None
    is_paused: bool
    volume: float
    mode: "DiscordPlayerModes"
    owner_name: str

    @classmethod
    def from_player_state(cls, player: "DiscordPlayerState"):
        return cls(
            player.guild.name,
            player.voice_client.channel.name,
            SongSchema.from_song(player.current_song) if player.current_song else None,
            player.voice_client.is_paused(),
            player.volume,
            player.mode,
            player.owner.name,
        )


@define
class PlayerStateResp:
    player_state: PlayerStateSchema
