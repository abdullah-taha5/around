FROM node:19.5.0-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN docker pull ghcr.io/puppeteer/puppeteer:19.8.0

CMD [ "npm", "start" ]

