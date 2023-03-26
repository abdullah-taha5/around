FROM node:10-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./


COPY . .

RUN chmod 755 /usr/src/app && npm install

CMD [ "npm", "start" ]
