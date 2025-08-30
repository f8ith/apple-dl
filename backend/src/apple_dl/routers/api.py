from fastapi import APIRouter

from .v1 import apple_music, discord, jobs

v1_router = APIRouter()
v1_router.include_router(apple_music.router)
v1_router.include_router(discord.router)
v1_router.include_router(jobs.router)

