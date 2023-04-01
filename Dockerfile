FROM node:18-alpine AS build-install

WORKDIR /app

RUN apk add --no-cache --virtual .gyp g++ make py3-pip gcc musl-dev

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

RUN apk del .gyp

FROM node:18-alpine AS build

WORKDIR /app

COPY --from=build-install /app/node_modules ./node_modules

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY types ./types

RUN yarn build

FROM node:18-alpine AS prod-install

WORKDIR /app

RUN apk add --no-cache --virtual .gyp g++ make py3-pip gcc musl-dev

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production --frozen-lockfile

RUN apk del .gyp

FROM node:18-alpine AS prod

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=prod-install /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY types ./types

CMD ["yarn", "start"]