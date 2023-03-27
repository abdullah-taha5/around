# FROM node:19.5.0-alpine

# ARG NODE_ENV=development
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN docker pull ghcr.io/puppeteer/puppeteer:19.8.0

# CMD [ "npm", "start" ]

FROM node:slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# INSTALL PUPPETEER DEPENDENCIES
RUN apt-get update && apt-get install gnupg wget chromium -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

CMD ["npm", "start"]
