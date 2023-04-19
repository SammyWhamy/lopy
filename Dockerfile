FROM node:18-alpine AS build-install

WORKDIR /app

RUN apk add --no-cache --virtual .gyp g++ make py3-pip gcc musl-dev

COPY package.json ./
COPY yarn.lock ./

COPY .yarn/releases ./.yarn/releases
COPY .yarn/plugins ./.yarn/plugins

COPY .yarnrc.yml ./

RUN yarn install --immutable --check-cache

RUN apk del .gyp

FROM node:18-alpine AS build

WORKDIR /app

COPY --from=build-install /app/.yarn/cache ./.yarn/cache
COPY --from=build-install /app/.yarn/releases ./.yarn/releases
COPY --from=build-install /app/.yarn/unplugged ./.yarn/unplugged

COPY yarn.lock ./
RUN yarn add -D @swc/cli @swc/core

COPY package.json ./
COPY .swcrc ./
COPY src ./src*

RUN yarn build

FROM node:18-alpine AS prod-install

WORKDIR /app

RUN apk add --no-cache --virtual .gyp g++ make py3-pip gcc musl-dev

COPY package.json ./
COPY yarn.lock ./

COPY .yarn/releases ./.yarn/releases
COPY .yarn/plugins ./.yarn/plugins

COPY .yarnrc.yml ./

RUN yarn workspaces focus --production

RUN apk del .gyp

FROM node:18-alpine AS prod

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY --from=prod-install /app/.yarn/cache ./.yarn/cache
COPY --from=prod-install /app/.yarn/unplugged ./.yarn/unplugged

COPY .pnp.cjs ./
COPY .pnp.loader.mjs ./

COPY .yarn/releases ./.yarn/releases
COPY .yarn/plugins ./.yarn/plugins
COPY .yarn/sdks ./.yarn/sdks

COPY .yarnrc.yml ./

COPY yarn.lock ./
COPY package.json ./

COPY src ./src

CMD ["yarn", "start"]
