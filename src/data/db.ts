import { Context } from "koishi";

declare module "koishi" {
  interface Tables {
    market: Market;
  }
}

export interface Market {
  id: string;
  shard: string;
  resourceType: string;
  price: number;
}

export const defineModel = (ctx: Context) => {
  ctx.model.extend("market", {
    id: "string",
    shard: "string",
    resourceType: "string",
    price: "float",
  });
};
