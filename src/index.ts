import { Context, Schema } from "koishi";
import { commands } from "./commands";
import { ScreepsApi } from "screeps-simple-api";
import { defineModel } from "./data/db";
import "koishi-plugin-cron";
import { updateMarketData } from "./data/updateMarket";

export const name = "screeps";

export const inject = {
  required: ["database", "cron"],
};

export interface Config {
  token: string;
}

export const Config: Schema<Config> = Schema.object({
  token: Schema.string().description("Screeps API Token").default(""),
});

let api: ScreepsApi;

export async function apply(ctx: Context, config: Config) {
  api = new ScreepsApi({
    token: config.token,
  });
  commands.forEach((cmd) => cmd.register(ctx, api));

  ctx.on("message", (session) => {});

  defineModel(ctx);

  ctx.cron("0 0 * * *", async () => {
    updateMarketData(ctx, api);
  });
}
