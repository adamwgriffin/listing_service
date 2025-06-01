import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { type Logger } from "pino";
import logger from "./lib/logger";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import httpLoggerMiddleware from "./middlewares/httpLoggerMiddleware";
import Repositories, { type IRepositories } from "./respositories";
import router from "./routes/router";
import {
  type IGeocoderService,
  createGeocodeService
} from "./services/geocoderService";

declare module "koa" {
  interface DefaultContext {
    log: Logger;
    db: IRepositories;
    geocodeService: IGeocoderService;
  }
}

const app = new Koa();
app
  .use(httpLoggerMiddleware)
  .use(errorMiddleware)
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());
app.context.log = logger;
app.context.db = Repositories;
app.context.geocodeService = createGeocodeService();
// Catching the error here allows us to use our logger and set the log level to
// "error" rather than relying on Koa's default error logging.
app.on("error", (err) => {
  logger.error({ err }, "Server error");
});

export default app;
