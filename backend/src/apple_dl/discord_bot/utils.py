import os
from discord.ext import commands

EXTENSION_PATH = ".discord_bot.extensions."
PACKAGE_PATH = "apple_dl"


def get_extension(extension: str) -> str:
    return EXTENSION_PATH + extension


async def send_public(ctx: commands.Context, message_str):
    if ctx.interaction:
        await ctx.interaction.response.send_message(message_str, ephemeral=True)
        return

    await ctx.send(message_str)


async def send_private(ctx: commands.Context, message_str):
    if ctx.interaction:
        await ctx.interaction.response.send_message(message_str, ephemeral=True)
        return

    channel = await ctx.author.create_dm()
    await channel.send(message_str)
