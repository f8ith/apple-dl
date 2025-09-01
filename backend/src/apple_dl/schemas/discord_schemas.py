from enum import Enum
from typing import Any

from pydantic import BaseModel

class DiscordPlayerModes(str, Enum):
    normal = "normal"
    repeat = "repeat"
    loop = "loop"

class SongSchema(BaseModel):
    id: int
    album_name: str
    artist_name: str
    name: str
    url: str
    image: str
    length: int
    lyrics: str
    synced_lyrics: str 

class PlayerStateSchema(BaseModel):
    guild_name: str
    channel_name: str
    current_song: SongSchema | None
    song_length: int | None
    song_played: int | None
    is_paused: bool
    volume: float
    mode: DiscordPlayerModes
    owner_name: str

class PlayerStateResp:
    player_state: PlayerStateSchema
