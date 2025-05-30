import type { Context } from "koa";
import { databaseIsConnected } from "../database";

export const health = async (ctx: Context) => {
  ctx.assert(databaseIsConnected(), 503, "Error connecting to database");
  ctx.status = 200;
};
