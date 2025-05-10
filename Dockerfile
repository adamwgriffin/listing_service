ARG NODE_VERSION
FROM node:$NODE_VERSION-alpine

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY . .

CMD ["yarn", "start"]
