FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci mkdir /usr/src/app && chown app:/usr/src/app /usr/src/app
COPY --chown=app:/usr/src/app . .
CMD [ "node", "index.js" ]
