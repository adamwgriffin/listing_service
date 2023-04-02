export const ping = async (ctx) => {
  try {
    ctx.body = {
      message: 'pong'
    }
  } catch (error) {
    console.error(error)
  }
}

export const check = async (ctx) => {
  try {
    ctx.body = {
      message: 'Check route'
    }
  } catch (error) {
    console.error(error)
  }
}
