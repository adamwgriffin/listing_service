import type { Context } from 'koa'

export const getListingsById = async (ctx: Context) => {
  const ids = ctx.params.ids.split(',') as string[]
  const listings = await ctx.repositories.listing.findByListingIds(ids)
  ctx.body = { listings }
}
