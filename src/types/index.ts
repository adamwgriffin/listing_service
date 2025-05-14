import { Context } from "koa";

/**
 * Set the types for context request query/params as well as the response body
 */
export type ControllerContext<ContextType, ResponseBodyType> = ContextType & {
  body: ResponseBodyType;
} & Context;
