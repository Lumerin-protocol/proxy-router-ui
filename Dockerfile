FROM node:lts-alpine as build
WORKDIR '/app'
COPY ./package.json ./

RUN apk add git
RUN npm install
COPY . .
#set environment variables for build
ARG REACT_APP_LUMERIN_TOKEN_ADDRESS
ENV REACT_APP_LUMERIN_TOKEN_ADDRESS=$REACT_APP_LUMERIN_TOKEN_ADDRESS
ARG REACT_APP_CLONE_FACTORY
ENV REACT_APP_CLONE_FACTORY=$REACT_APP_CLONE_FACTORY
ARG REACT_APP_ETHERSCAN_URL
ENV REACT_APP_ETHERSCAN_URL=$REACT_APP_ETHERSCAN_URL

RUN npm run build

FROM nginx
EXPOSE 80
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html