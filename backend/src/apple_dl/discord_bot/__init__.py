import asyncio

import discord
from discord.ext import commands

from apple_dl.config import cfg
from apple_dl.discord_bot.bot import DiscordBot
from apple_dl.discord_bot.player import DiscordPlayerManager
from apple_dl.discord_bot.utils import PACKAGE_PATH, get_extension
from apple_dl.logger import logger

intents = discord.Intents.default()
intents.message_content = True

bot = DiscordBot(command_prefix=cfg.DISCORD_BOT_PREFIX, intents=intents)


async def run_bot():
    for extension in cfg.ENABLED_EXTENSIONS:
        try:
            await bot.load_extension(get_extension(extension), package=PACKAGE_PATH)
        except Exception as e:
            logger.error(
                "Failed to load extension {} because of error {}.".format(extension, e)
            )

    loop = asyncio.get_event_loop()
    await bot.login(cfg.DISCORD_BOT_TOKEN)
    loop.create_task(bot.connect())
