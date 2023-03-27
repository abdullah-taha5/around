# FROM node:19.5.0-alpine

# ARG NODE_ENV=development
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN docker pull ghcr.io/puppeteer/puppeteer:19.8.0

# CMD [ "npm", "start" ]

FROM node:latest
WORKDIR /puppeteer
RUN apt-get install -y 
    fonts-liberation 
    gconf-service 
    libappindicator1 
    libasound2 
    libatk1.0-0 
    libcairo2 
    libcups2 
    libfontconfig1 
    libgbm-dev 
    libgdk-pixbuf2.0-0 
    libgtk-3-0 
    libicu-dev 
    libjpeg-dev 
    libnspr4 
    libnss3 
    libpango-1.0-0 
    libpangocairo-1.0-0 
    libpng-dev 
    libx11-6 
    libx11-xcb1 
    libxcb1 
    libxcomposite1 
    libxcursor1 
    libxdamage1 
    libxext6 
    libxfixes3 
    libxi6 
    libxrandr2 
    libxrender1 
    libxss1 
    libxtst6 
    xdg-utils
    
COPY package.json .
COPY package-lock.json .
RUN npm ci
RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium
docker build . -t puppeteer:latest
