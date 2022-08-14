FROM node:18.6-bullseye-slim

WORKDIR /app

RUN apt-get update &&  apt-get install -y make gcc g++ python  && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY package.json /app/
RUN yarn install --pure-lockfile && yarn cache clean
COPY src /app/src
COPY public /app/public

#ENV NODE_OPTIONS=--max_old_space_size=3072

RUN yarn build

COPY .env /app/

CMD [ "yarn", "start" ]
