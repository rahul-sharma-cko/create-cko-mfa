FROM node:18-alpine as build

WORKDIR /usr/src/app

COPY . .

RUN yarn add -D webpack-cli --yes

EXPOSE 3050

CMD [ "yarn", "dev" ]
