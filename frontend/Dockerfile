FROM node:lts-alpine AS base

FROM base AS deps

RUN addgroup appledl && \
    adduser -D appledl -G appledl

ENV HOSTNAME="apple-dl"

# dependencies
# RUN --mount=type=cache,target=/var/cache/apk \
RUN apk update
RUN --mount=type=cache,target=/var/cache/apk \
    apk add \
    nginx \
    bash \
    git \
    bento4

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
COPY . ./frontend/
RUN rm -rf ./frontend/node_modules
RUN chown -R appledl:appledl /repo

# Extract version from package.json
#RUN mkdir -p /version
#RUN node -c "import json; print(json.load(open('/repo/frontend/package.json'))['version'])" \
#    > /version/frontend.txt

WORKDIR /repo/frontend
# RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
RUN pnpm install
RUN pnpm run build

# ------------------------------------------------------------------------------------ #
#                                      Production                                      #
# ------------------------------------------------------------------------------------ #

FROM deps AS prod

ENV APPLEDL_HOSTNAME="apple-dl-server"

WORKDIR /repo/frontend
COPY --from=build /repo/frontend/docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
#COPY --from=build /version /version
COPY docker/entrypoint.sh .
RUN ["chmod", "+x", "./entrypoint.sh"]
RUN chown -R appledl:appledl /repo

USER root

ENTRYPOINT [ \
    "/repo/frontend/entrypoint.sh" \
    ]

EXPOSE 6887

#CMD ["uvicorn", "apple_dl:create_app()", "--port", "6887"]
#CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "apple_dl:create_app()"]
CMD ["nginx", "-g", "daemon off;"]

