FROM node:18-alpine as dev

WORKDIR /usr/srcs/app

COPY ./srcs/*.json ./srcs/index.html ./srcs/vite.config.ts ./
COPY ./srcs/public ./public

RUN npm install --loglevel verbose

CMD ["npm", "run", "dev"]

FROM node:18-alpine as prod

WORKDIR /usr/srcs/app

COPY ./srcs/ ./

RUN npm ci

CMD ["npm", "run", "dev"]