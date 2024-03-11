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
ARG REACT_APP_GITBOOK_URL
ENV REACT_APP_GITBOOK_URL=$REACT_APP_GITBOOK_URL
ARG REACT_APP_INDEXER_URL
ENV REACT_APP_INDEXER_URL=$REACT_APP_INDEXER_URL
ARG REACT_APP_ETHERSCAN_URL
ENV REACT_APP_ETHERSCAN_URL=$REACT_APP_ETHERSCAN_URL
ARG REACT_APP_LUMERIN_TOKEN_ADDRESS
ENV REACT_APP_LUMERIN_TOKEN_ADDRESS=$REACT_APP_LUMERIN_TOKEN_ADDRESS
ARG REACT_APP_READ_ONLY_ETH_NODE_URL
ENV REACT_APP_READ_ONLY_ETH_NODE_URL=$REACT_APP_READ_ONLY_ETH_NODE_URL
ARG REACT_APP_TITAN_LIGHTNING_DASHBOARD
ENV REACT_APP_TITAN_LIGHTNING_DASHBOARD=$REACT_APP_TITAN_LIGHTNING_DASHBOARD
ARG REACT_APP_TITAN_LIGHTNING_POOL
ENV REACT_APP_TITAN_LIGHTNING_POOL=$REACT_APP_TITAN_LIGHTNING_POOL
ARG REACT_APP_VALIDATOR_URL
ENV REACT_APP_VALIDATOR_URL=$REACT_APP_VALIDATOR_URL
ARG REACT_APP_VALIDATOR_PUBLIC_KEY
ENV REACT_APP_VALIDATOR_PUBLIC_KEY=$REACT_APP_VALIDATOR_PUBLIC_KEY

RUN npm run build

FROM nginx
EXPOSE 80
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html