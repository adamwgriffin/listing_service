import type { Context } from 'koa'
import type { Middleware } from '@koa/router'
import type { ZodIssue, ZodTypeAny, SafeParseSuccess } from 'zod'
import type { ServiceError } from '../types/listing_search_response_types'

const formatError = (e: ZodIssue) => {
  const err: ServiceError = {
    message: e.message
  }
  if (e.path.length) {
    err.field = e.path.join('.')
  }
  return err
}

// Parsing the data will convert the values from strings into the correct types defined in the schema since it will be
// using `.coerce()`. We will want to use these converted values later on in the controller so we update ctx.
const assignParsedResultToContext = (
  result: SafeParseSuccess<Pick<Context, 'body' | 'query' | 'params'>>,
  ctx: Context
) => {
  if (result.data.body) {
    ctx.body = result.data.body
  }
  if (result.data.query) {
    // We're using Object.assign for this because ctx.query is not a POJO, it's a getter so, we need to use
    // Object.assign as an interface for mutating it instead.
    Object.assign(ctx.query, result.data.query)
  }
  if (result.data.params) {
    Object.assign(ctx.params, result.data.params)
  }
}

export const parseAndValidateRequest = (schema: ZodTypeAny): Middleware => {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const { body, query, params } = ctx
    const result = schema.safeParse({ body, query, params })
    if (result.success) {
      assignParsedResultToContext(result, ctx)
    } else {
      ctx.throw(400, 'Validation Error', {
        errors: result.error.errors.map(formatError)
      })
    }
    await next()
  }
}
