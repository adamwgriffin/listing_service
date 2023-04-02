export const listing = async (ctx) => {
  const id = ctx.params.id
  const { listingId } = ctx.query
  try {
    ctx.body = { id, listingId }
  } catch (error) {
    ctx.body = { error }
    ctx.status = 400
  }
}
