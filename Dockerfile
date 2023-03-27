FROM node:19.5.0-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod /usr/src/app/images 777

CMD [ "npm", "start" ]

