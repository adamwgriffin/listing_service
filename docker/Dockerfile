ARG NODE_VERSION=latest
FROM node:$NODE_VERSION-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]
