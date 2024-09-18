import type { Context } from 'koa'

// Based on https://github.com/koajs/koa/wiki/Error-Handling
export const errorMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      errors: err.errors || [{ errors: err.message || 'Internal Server Error' }]
    }
    ctx.app.emit('error', err, ctx)
  }
}
