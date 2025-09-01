from typing import Any

from pydantic import BaseModel

class GamdlJobResultSchema(BaseModel):
    status: str
    stdout: str
    stderr: str

class GamdlJobSchema(BaseModel):
    id: int
    album_name: str | None
    artist_name: str | None
    name: str
    attributes: dict[str, Any]
    url: str
    image: str | None
    type: str
    status: str
    error: str | None

