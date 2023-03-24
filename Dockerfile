FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN mkdir /usr/src/app && chown app:app /usr/src/app

WORKDIR /usr/src/app
COPY --chown=app:app . .
RUN npm install

CMD ["node", "index.js"]
