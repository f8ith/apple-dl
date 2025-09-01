from copy import deepcopy
import random

from discord import Member, VoiceState
from discord.ext import commands

from apple_dl.config import cfg
from apple_dl.discord_bot.bot import DiscordBot
from apple_dl.discord_bot.utils import send_message
from apple_dl.logger import logger

async def setup(bot: DiscordBot):
    """Set up the extension."""
    await bot.add_cog(Music(bot))


class Music(commands.Cog):
    def __init__(self, bot: DiscordBot):
        self.bot = bot
        self._last_member = None
        self.player_manager = bot.player_manager

    @staticmethod
    async def on_ready():
        """Print when the extension is ready."""
        logger.info("Music extension loaded")

    @commands.hybrid_command()
    @commands.guild_only()
    async def connect(self, ctx: commands.Context):
        guild = ctx.guild
        author: Member = ctx.author  # type: ignore
        assert guild and author
        if not author.voice or not author.voice.channel:
            await send_message(ctx, "you are not in a voice channel")
            return

        if guild.voice_client:
            await send_message(ctx, "someone else is already connected")
            return

        player_id = await self.player_manager.connect_player(ctx)

        message_str = f'access control panel througe: {cfg.SERVER_URL}/discord-bot?player_id={player_id}'
        await send_message(ctx, message_str, ephemeral=True)

    @commands.hybrid_command()
    @commands.guild_only()
    async def disconnect(self, ctx: commands.Context):
        guild = ctx.guild
        author: Member = ctx.author  # type: ignore
        assert guild and author

        player = self.player_manager.by_guild(guild.id)

        if not player:
            await send_message(
                ctx, content="no client is connected, may be dangling voice client"
            )
            await guild.change_voice_state(channel=None)
            return

        if player.owner.id != author.id:
            owner_voice = await player.owner.fetch_voice()
            if (
                owner_voice
                and owner_voice.channel
                and owner_voice.channel.id == player.channel_id
            ):
                await send_message(ctx, "you are not the owner of the session")
                return
        # If owner is somehow not in the voice channel anymore, disconnect

        await self.player_manager.disconnect_player(player)
        await send_message(ctx, "disconnected player")

    @commands.Cog.listener()
    async def on_voice_state_update(
        self, member: Member, before: VoiceState, after: VoiceState
    ):
        if before.channel:
            player = self.player_manager.by_channel(before.channel.id)
            if not player:
                return

            if member.id == player.guild.me.id:
                # we were disconnected by a user
                self.player_manager.cleanup(player)

            if len(before.channel.members) <= 1:
                await self.player_manager.disconnect_player(player)
                return

            members = deepcopy(before.channel.members)

            if member.id == player.owner.id:
                for i in members:
                    if i.id == player.guild.me.id:
                        members.remove(i)

                player.owner = random.choice(members)

            # TODO Maybe send a message
