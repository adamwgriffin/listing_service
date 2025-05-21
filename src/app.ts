import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./routes/router";
import { errorMiddleware } from "./middlewares/error_middleware";
import Repositories, { type IRepositories } from "./respositories";
import {
  type IGeocoderService,
  buildGeocodeService
} from "./services/geocoderService";

declare module "koa" {
  interface DefaultContext {
    db: IRepositories;
    geocodeService: IGeocoderService;
  }
}

/**
 * Create app instance with middleware and routes, optionally inject custom
 * repositories and geocodeService dependencies.
 */
export const buildApp = (
  respositories?: IRepositories,
  geocoderService?: IGeocoderService
) => {
  const app = new Koa();
  app
    .use(errorMiddleware)
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());
  app.context.db = respositories || Repositories;
  app.context.geocodeService = geocoderService || buildGeocodeService();
  return app;
};
