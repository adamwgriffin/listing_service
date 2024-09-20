import { Context } from 'koa'
import type { Middleware } from '@koa/router'
import { ZodTypeAny } from 'zod'

export const validateQuery = (schema: ZodTypeAny): Middleware => {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const result = schema.safeParse(ctx.query)
    if (!result.success) {
      ctx.throw(400, 'Validation Error', {
        errors: result.error.errors.map((e) => {
          return {
            message: e.message,
            field: e.path.join(',')
          }
        })
      })
    }
    await next()
  }
}
