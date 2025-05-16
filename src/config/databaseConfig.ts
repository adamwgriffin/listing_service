import env from "../lib/env";

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = env;
export const MongoDbUrl = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
export const MongoDbOptions = {};
