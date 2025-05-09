import type { Context } from 'koa'

export const ping = async (ctx: Context) => {
  try {
    ctx.body = {
      message: 'pong'
    }
  } catch (error) {
    console.error(error)
  }
}