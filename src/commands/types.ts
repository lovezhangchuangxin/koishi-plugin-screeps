import { Context } from "koishi";
import { ScreepsApi } from "screeps-simple-api";

export interface CommandConfig {
  name: string;
  register: (ctx: Context, api: ScreepsApi) => void;
}

export const defineCommand = (config: CommandConfig) => {
  return config;
};
