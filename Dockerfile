FROM node:8-onbuild

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable xvfb
ENV INSIDE_DOCKER true
ENV CHROME_BIN /usr/bin/google-chrome
ENV DISPLAY :99.0
CMD Xvfb $DISPLAY & npm run build && npm test
