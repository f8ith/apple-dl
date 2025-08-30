from logging import getLogger
from apple_dl.discord_bot.utils import PACKAGE_PATH, get_extension
from discord.ext import commands


async def setup(bot: commands.Bot):
    """Set up the extension."""
    await bot.add_cog(Admin(bot))


class Admin(commands.Cog):
    """Administration class."""

    @staticmethod
    async def on_ready():
        """Print when the extension is ready."""
        getLogger("quart.discord_bot").info("Admin extension loaded")

    def __init__(self, bot: commands.Bot):
        """Initizises debug extension."""
        self.bot = bot

    @commands.command()
    @commands.is_owner()
    async def logout(self, ctx):
        """Log out of the bot user."""
        await self.bot.close()

    @commands.command()
    @commands.is_owner()
    async def sync(self, ctx):
        """Sync command tree."""
        await self.bot.tree.sync()

    @commands.command()
    @commands.is_owner()
    async def reload(self, ctx, extension):
        """Reload extension."""
        await self.bot.reload_extension(get_extension(extension), package=PACKAGE_PATH)
        await ctx.send(f"{extension} has been reloaded.")

    @commands.command()
    @commands.is_owner()
    async def unload(self, ctx, extension):
        """Unload extension."""
        await self.bot.unload_extension(get_extension(extension), package=PACKAGE_PATH)
        await ctx.send(f"{extension} has been unloaded.")

    @commands.command()
    @commands.is_owner()
    async def load(self, ctx, extension):
        """Load extension."""
        await self.bot.load_extension(get_extension(extension), package=PACKAGE_PATH)
        await ctx.send(f"{extension} has been loaded.")
