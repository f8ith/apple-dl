FROM python:3.12-alpine3.20 AS base

FROM base AS deps

RUN addgroup -g 1000 appledl && \
    adduser -D -u 1000 -G appledl appledl

ENV HOSTNAME="apple-dl"

# map beets directory and our configs to /config
RUN mkdir -p /config/
RUN mkdir -p /logs
RUN chown -R appledl:appledl /config
RUN chown -R appledl:appledl /logs

RUN mkdir -p /downloads

# dependencies
# RUN --mount=type=cache,target=/var/cache/apk \
RUN apk update
RUN --mount=type=cache,target=/var/cache/apk \
    apk add \
    bash \
    tmux \
    git \
    ffmpeg \
    bento4


# Install backend dependencies

# Prevent __pycache__ directories
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir poetry


WORKDIR /repo/backend
COPY ./backend/pyproject.toml /repo/backend/
COPY ./backend/README.md /repo/backend/
COPY ./README.md /repo/

# Install our package (backend)
COPY ./backend/src/ /repo/backend/src/

RUN poetry install

# Extract version from pyproject.toml
RUN mkdir -p /version
RUN python -c "import tomllib; print(tomllib.load(open('/repo/backend/pyproject.toml', 'rb'))['tool']['poetry']['version'])" > /version/backend.txt

# ------------------------------------------------------------------------------------ #
#                                         Build                                        #
# ------------------------------------------------------------------------------------ #

FROM deps AS build
# Build frontend files

RUN --mount=type=cache,target=/var/cache/apk \
    apk add \
    npm

RUN npm install -g pnpm
RUN pnpm config set store-dir /repo/frontend/.pnpm-store

WORKDIR /repo
COPY frontend/ ./frontend/
RUN rm -rf ./frontend/node_modules
RUN chown -R appledl:appledl /repo

# Extract version from package.json
RUN mkdir -p /version
RUN python -c "import json; print(json.load(open('/repo/frontend/package.json'))['version'])" \
    > /version/frontend.txt

USER appledl
WORKDIR /repo/frontend
# RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
RUN pnpm install
RUN pnpm run build


# ------------------------------------------------------------------------------------ #
#                                      Production                                      #
# ------------------------------------------------------------------------------------ #

FROM deps AS prod

ENV IB_SERVER_CONFIG="prod"
ENV FRONTEND_DIST_DIR="/repo/frontend/dist"
ENV GAMDL_DIR="/config/"
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:6887 --workers=1"

WORKDIR /repo
COPY --from=build /repo/frontend/dist /repo/frontend/dist
COPY --from=build /version /version
COPY docker/entrypoint.sh .
RUN ["chmod", "+x", "./entrypoint.sh"]
RUN chown -R appledl:appledl /repo

USER root

ENTRYPOINT [ \
    "/repo/entrypoint.sh" \
    ]

#CMD ["uvicorn", "apple_dl:create_app()", "--port", "6887"]
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "apple_dl:create_app()"]
