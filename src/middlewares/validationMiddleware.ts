import { Context } from 'koa'
import { ZodTypeAny } from 'zod'

export const validateQuery = (schema: ZodTypeAny) => {
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
