# FROM node:19.5.0-alpine

# ARG NODE_ENV=development
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN chmod 755 /usr/src/app

# CMD [ "npm", "start" ]

FROM node:19.5.0-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

RUN mkdir -p /home/node/pdfFiles

RUN mkdir -p /home/node/uploads
WORKDIR /home/node/app

RUN chmod -R 777 /home/node/pdfFiles

COPY package*.json ./

USER node

RUN npm install

RUN npm install concurrently

RUN npm install chrome-aws-lambda

COPY --chown=node:node . .

EXPOSE 8019

CMD [ "npm", "start" ]
