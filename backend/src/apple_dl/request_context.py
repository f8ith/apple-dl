from apple_dl.discord_bot.player import DiscordPlayerState
import quart


class _g:

    player: DiscordPlayerState
    # Add type hints for other attributes
    # ...

    def __getattr__(self, key):
        return getattr(quart.g, key)


g = _g()


def get_context():
    return g
