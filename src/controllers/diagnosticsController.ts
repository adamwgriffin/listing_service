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

export const check = async (ctx: Context) => {
  try {
    ctx.body = {
      message: 'Check route'
    }
  } catch (error) {
    console.error(error)
  }
}
