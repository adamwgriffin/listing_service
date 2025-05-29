import Koa, { type Middleware } from "koa";
import bodyParser from "koa-bodyparser";
import { type Logger } from "pino";
import logger from "./lib/logger";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import Repositories, { type IRepositories } from "./respositories";
import router from "./routes/router";
import {
  type IGeocoderService,
  buildGeocodeService
} from "./services/geocoderService";

declare module "koa" {
  interface DefaultContext {
    log: Logger;
    db: IRepositories;
    geocodeService: IGeocoderService;
  }
}

/**
 * Create app instance with middleware and routes, optionally inject custom
 * repositories and geocodeService dependencies.
 */
export const buildApp = (
  extraMIddleware?: Middleware[],
  respositories?: IRepositories,
  geocoderService?: IGeocoderService
) => {
  const app = new Koa();
  if (extraMIddleware) {
    for (const middleware of extraMIddleware) {
      app.use(middleware);
    }
  }
  app
    .use(errorMiddleware)
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());
  app.context.log = logger;
  app.context.db = respositories || Repositories;
  app.context.geocodeService = geocoderService || buildGeocodeService();
  return app;
};
