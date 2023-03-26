# FROM node:19.5.0-alpine

# ARG NODE_ENV=development
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN chmod 755 /usr/src/app

# CMD [ "npm", "start" ]

FROM node:10-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update 
RUN apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64  /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-unstable'})
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install puppeteer so it's available in the container.
RUN yarn config set strict-ssl false
WORKDIR /home/node/app

RUN adduser node root
COPY . /home/node/app
RUN npm install puppeteer --unsafe-perm=true \
    && mkdir -p /home/node/app/public \
    && mkdir -p /home/node/app/forms \
    && mkdir -p /home/node/app/json \
    && chown -R node:root /home/node/app \
    && chmod -R 755 /home/node/app \
    && chown -R node:root /usr/local/lib/node_modules \
    && mkdir -p /usr/local/lib/node_modules \
    && mkdir -p /home/node/app/node_modules/ \
	&& chown node:root /home/node/app/node_modules/
    # RUN mkdir -p /home/node/app/public/json \
    # && mkdir -p /home/node/app/public/images \
    #     && mkdir -p /home/node/app/public/forms




#RUN npm -g config set user root

RUN npm config set strict-ssl false \
    && npm install -g json-server --unsafe-perm=true \
	&& npm install -g nodemon
RUN  npm i -ddd
COPY package.json package.json
RUN npm i

# Run everything after as non-privileged user.
USER node
#RUN groupmod -g 500 node && usermod -u 500 node





EXPOSE 7000
USER 1000
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
