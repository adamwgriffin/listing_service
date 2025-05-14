import Router from "@koa/router";
import { ping } from "../controllers/healthcheckController";

export default new Router().get("/ping", ping);
