import asyncio
from logging import getLogger
from apple_dl.config import cfg
from apple_dl.discord_bot.bot import DiscordBot
from apple_dl.discord_bot.player import DiscordPlayerManager
from apple_dl.discord_bot.utils import PACKAGE_PATH, get_extension
import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

bot = DiscordBot(command_prefix="!", intents=intents)


async def run_bot():
    for extension in cfg.ENABLED_EXTENSIONS:
        try:
            await bot.load_extension(get_extension(extension), package=PACKAGE_PATH)
        except Exception as e:
            getLogger("quart.discord_bot").error(
                "Failed to load extension {} because of error {}.".format(extension, e)
            )

    loop = asyncio.get_event_loop()
    await bot.login(cfg.DISCORD_BOT_TOKEN)
    loop.create_task(bot.connect())
