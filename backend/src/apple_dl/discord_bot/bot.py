from logging import getLogger

from discord.ext import commands

from apple_dl.discord_bot.player import DiscordPlayerManager


class DiscordBot(commands.Bot):  # subclass discord.Bot
    def __init__(self, *args, **kwargs):
        super(commands.Bot, self).__init__(*args, **kwargs)
        self.player_manager = DiscordPlayerManager()

    async def on_ready(self):  # override the on_ready event
        getLogger("quart.discord_bot").info(f"logged in as {self.user}")
