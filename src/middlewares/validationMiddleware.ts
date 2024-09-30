import type { Context } from 'koa'
import type { Middleware } from '@koa/router'
import type { ZodIssue, ZodTypeAny } from 'zod'
import type { ValidationError } from '../types/listing_search_response_types'

const formatError = (e: ZodIssue) => {
  const err: ValidationError = {
    message: e.message
  }
  if (e.path.length) {
    err.field = e.path.join('.')
  }
  return err
}

// Parsing the data will convert the values from strings into the correct types defined in the schema since it will be
// using `.coerce()`. We will want to use these converted values later on in the controller so we update ctx.query.
// We're using Object.assign for this because ctx.query is not a POJO, it's a getter so, we need to use Object.assign as
// an interface for mutating it instead.
export const parseQuery = (schema: ZodTypeAny): Middleware => {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const result = schema.safeParse(ctx.query)
    if (result.success) {
      Object.assign(ctx.query, result.data)
    } else {
      ctx.throw(400, 'Validation Error', {
        errors: result.error.errors.map(formatError)
      })
    }
    await next()
  }
}
