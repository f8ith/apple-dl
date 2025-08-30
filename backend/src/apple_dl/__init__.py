from quart import Quart
from quart_cors import cors
from quart_schema import QuartSchema

from .config import cfg
from .routes.websocket import register_socketio
from .routes import api_bp, frontend_bp, discord_bp
from .logging import load_logging


def create_app() -> Quart:
    app = Quart(
        __name__,
        static_url_path="",
        static_folder=str(cfg.FRONTEND_DIST_DIR),
        template_folder=str(cfg.FRONTEND_DIST_DIR),
    )
    load_logging()
    app.config.from_object(cfg)
    app = cors(app)
    QuartSchema(app)

    app.register_blueprint(frontend_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(discord_bp, url_prefix="/api/discord")

    register_socketio(app)
    return app


def run() -> None:
    app = create_app()
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        return
