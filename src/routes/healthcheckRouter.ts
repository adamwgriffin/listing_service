import Router from "@koa/router";
import { health } from "../controllers/healthcheckController";

export default new Router().get("/health", health);
