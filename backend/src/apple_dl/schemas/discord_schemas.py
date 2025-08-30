from enum import Enum
from typing import Any

from pydantic import BaseModel

class DiscordPlayerModes(str, Enum):
    normal = "normal"
    repeat = "repeat"
    loop = "loop"

class SongSchema(BaseModel):
    id: int
    job_id: int
    album_name: str | None
    artist_name: str | None
    name: str
    attributes: dict[str, Any]
    url: str
    image: str | None
    type: str
    status: str

class PlayerStateSchema(BaseModel):
    guild_name: str
    channel_name: str
    current_song: SongSchema | None
    song_length: int
    song_played: int
    is_paused: bool
    volume: float
    mode: DiscordPlayerModes
    owner_name: str

class PlayerStateResp:
    player_state: PlayerStateSchema
