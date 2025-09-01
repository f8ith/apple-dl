FROM nginx:stable-alpine AS base

FROM base AS deps

RUN addgroup appledl && \
    adduser -D appledl -G appledl

ENV HOSTNAME="apple-dl"

# dependencies
# RUN --mount=type=cache,target=/var/cache/apk \
RUN apk update
RUN --mount=type=cache,target=/var/cache/apk \
    apk add \
    bash \
    git

# ------------------------------------------------------------------------------------ #
#                                         Build                                        #
# ------------------------------------------------------------------------------------ #

FROM node:lts-alpine AS build
# Build frontend files

RUN addgroup appledl && \
    adduser -D appledl -G appledl

RUN --mount=type=cache,target=/var/cache/apk \
    apk add \
    npm

RUN npm install -g pnpm
RUN pnpm config set store-dir /repo/frontend/.pnpm-store

WORKDIR /repo
COPY . ./frontend/
RUN rm -rf ./frontend/node_modules
RUN chown -R appledl:appledl /repo

WORKDIR /repo/frontend
# RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
RUN pnpm install
RUN pnpm run build

# Extract version from package.json
RUN mkdir -p /version
RUN node -e "var pjson = require('./package.json'); console.log(pjson.version);" > /version/frontend.txt

# ------------------------------------------------------------------------------------ #
#                                      Production                                      #
# ------------------------------------------------------------------------------------ #

FROM deps AS prod

ENV APPLEDL_HOSTNAME="apple-dl-server"
ENV SERVER_URL="http://localhost:6887" 

WORKDIR /repo/frontend
COPY --from=build /repo/frontend/docker/apple-dl.conf.template /etc/nginx/templates/apple-dl.conf.template
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /version /version
RUN chown -R appledl:appledl /repo

USER root

EXPOSE 6887

CMD ["nginx", "-g", "daemon off;"]
