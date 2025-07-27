import { Context } from "koishi";
import { ScreepsApi } from "screeps-simple-api";
import { Market } from "./db";

export const marketDataCache = new Map<string, number>();

export const getResourcePrice = async (
  ctx: Context,
  shard: string,
  resourceType: string
): Promise<number | undefined> => {
  const id = `${shard}-${resourceType}`;
  if (marketDataCache.has(id)) {
    return marketDataCache.get(id);
  }

  const marketData = await ctx.database.get("market", id);
  const price = marketData.length ? marketData[0].price : undefined;
  if (price) {
    marketDataCache.set(id, price);
  }
  return price;
};

export const updateMarketData = async (ctx: Context, api: ScreepsApi) => {
  const shards = ["shard0", "shard1", "shard2", "shard3"] as const;
  shards.forEach(async (shard) => {
    const marketInfo = await api.getMarketOrdersIndex(shard);
    if (!marketInfo.ok) {
      return;
    }
    const marketData: Record<
      string,
      { totalPrice: number; totalCount: number }
    > = {};
    marketInfo.list.forEach((info) => {
      if (!marketData[info._id]) {
        marketData[info._id] = { totalPrice: 0, totalCount: 0 };
      }

      marketData[info._id].totalPrice += info.avgPrice * info.count;
      marketData[info._id].totalCount += info.count;
    });

    const newDatas = Object.entries(marketData).map(
      ([type, { totalPrice, totalCount }]) => {
        const id = `${shard}-${type}`;
        const data: Market = {
          id,
          shard,
          resourceType: type,
          price: totalCount ? Number((totalPrice / totalCount).toFixed(3)) : 0,
        };
        marketDataCache.set(id, data.price);
        return data;
      }
    );

    ctx.database.upsert("market", newDatas);
  });
};
