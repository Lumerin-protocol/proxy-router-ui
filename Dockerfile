FROM node:16.20.2-alpine as build
WORKDIR '/app'

RUN apk add git

COPY ./package.json ./
RUN npm install
COPY . .

# keep alphabetically sorted
ARG REACT_APP_CHAIN_ID
ENV REACT_APP_CHAIN_ID=$REACT_APP_CHAIN_ID
ARG REACT_APP_CLONE_FACTORY
ENV REACT_APP_CLONE_FACTORY=$REACT_APP_CLONE_FACTORY
ARG REACT_APP_ETHERSCAN_URL
ENV REACT_APP_ETHERSCAN_URL=$REACT_APP_ETHERSCAN_URL
ARG REACT_APP_LUMERIN_TOKEN_ADDRESS
ENV REACT_APP_LUMERIN_TOKEN_ADDRESS=$REACT_APP_LUMERIN_TOKEN_ADDRESS
ARG REACT_APP_VALIDATOR_ADDRESS
ENV REACT_APP_VALIDATOR_ADDRESS=$REACT_APP_VALIDATOR_ADDRESS
ARG REACT_APP_VALIDATOR_PUBLIC_KEY
ENV REACT_APP_VALIDATOR_PUBLIC_KEY=$REACT_APP_VALIDATOR_PUBLIC_KEY

RUN npm run build

FROM nginx
EXPOSE 80
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html