FROM python:3.12-alpine AS base

FROM base AS deps

RUN addgroup appledl && \
    adduser -D appledl -G appledl

ENV HOSTNAME="apple-dl"

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

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir poetry

FROM deps AS build
WORKDIR /repo/backend
COPY ./pyproject.toml /repo/backend/
COPY ./README.md /repo/backend/
COPY ./README.md /repo/

COPY ./src/ /repo/backend/src/

RUN poetry install

# Extract version from pyproject.toml
RUN mkdir -p /version
RUN python -c "import tomllib; print(tomllib.load(open('/repo/backend/pyproject.toml', 'rb'))['tool']['poetry']['version'])" > /version/backend.txt


# ------------------------------------------------------------------------------------ #
#                                      Production                                      #
# ------------------------------------------------------------------------------------ #

FROM deps AS prod

ENV IB_SERVER_CONFIG="prod"
ENV GAMDL_DIR="/config/"
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:8000 --workers=1"

WORKDIR /repo/backend
COPY --from=build /version /version
COPY docker/entrypoint.sh .
RUN ["chmod", "+x", "./entrypoint.sh"]
RUN chown -R appledl:appledl /repo

USER appledl

ENTRYPOINT [ \
    "/repo/backend/entrypoint.sh" \
    ]

EXPOSE 8000

#CMD ["uvicorn", "apple_dl:create_app()", "--port", "6887"]
#CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "apple_dl:create_app()"]
CMD ["fastapi", "run", "backend/src/apple_dl/main.py", "--proxy-headers", "--port", "8000"]
