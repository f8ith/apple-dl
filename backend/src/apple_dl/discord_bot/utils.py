from discord import Embed
from discord.ext import commands

EXTENSION_PATH = ".discord_bot.extensions."
PACKAGE_PATH = "apple_dl"


def get_extension(extension: str) -> str:
    return EXTENSION_PATH + extension

async def send_embed(ctx: commands.Context, embed: Embed, ephemeral: bool = False):
    if ctx.interaction:
        if embed:
            await ctx.interaction.response.send_message(embed=embed, ephemeral=ephemeral, delete_after=300)
        return

    if ephemeral:
        channel = await ctx.author.create_dm()
        await channel.send(embed=embed)

    else:
        await ctx.send(embed=embed)

async def send_message(ctx: commands.Context, content: str, ephemeral: bool = False):
    if ctx.interaction:
        await ctx.interaction.response.send_message(content, ephemeral=ephemeral, delete_after=300)
        return

    if ephemeral:
        channel = await ctx.author.create_dm()
        await channel.send(content)

    else:
        await ctx.send(content)