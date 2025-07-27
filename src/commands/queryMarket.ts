import { Shard } from "screeps-simple-api";
import { defineCommand } from "./types";

export default defineCommand({
  name: "market",
  register(ctx, api) {
    ctx
      .command("market <resource> <shard> <type>", "查询市场资源信息")
      .alias("市场")
      .alias("查市场")
      .action(
        async (
          _,
          resource: string,
          targetShard: Shard,
          type: "buy" | "sell"
        ) => {
          if (!resource) {
            return "请提供想查询的资源名称";
          }

          if (resource.length === 1) {
            resource = resource.toUpperCase();
          }
          targetShard ||= "shard3";
          if (!["shard0", "shard1", "shard2", "shard3"].includes(targetShard)) {
            return "无效的shard";
          }

          let isGlobalRes = false;
          if (["pixel", "cpuUnlock", "accessKey"].includes(resource)) {
            isGlobalRes = true;
          }

          // 默认买单
          type ||= "buy";
          if (!["buy", "sell"].includes(type)) {
            return "无效的查询类型，请选择 'buy' 或 'sell'";
          }

          try {
            const res = await api.getOrdersByResourceType(
              resource,
              !isGlobalRes ? targetShard : undefined
            );
            if (!res.ok) {
              return `查询市场资源信息失败: ${res.error}`;
            }

            const maxLen = 10;
            const orders = res.list.filter((order) => order.type === type);
            orders.sort((a, b) => {
              if (type === "buy") {
                return b.price - a.price; // 买单按价格降序
              }
              return a.price - b.price; // 卖单按价格升序
            });
            const filteredOrders = orders.slice(0, maxLen);
            const roomNames = Array.from(
              new Set(filteredOrders.map((order) => order.roomName))
            ).filter(Boolean);
            const mapRes = await api.getMapStats(
              roomNames,
              targetShard,
              "owner0"
            );
            if (!mapRes.ok) {
              return `查询房间信息失败: ${mapRes.error}`;
            }

            const getUser = (roomName: string) => {
              return (
                mapRes.users[mapRes.stats[roomName]?.own?.user]?.username ||
                "Invader"
              );
            };

            return (
              `${targetShard} ${resource} ${
                type === "buy" ? "买单" : "卖单"
              }\n` +
              filteredOrders
                .map((order) => {
                  return `${order.price.toFixed(3).padEnd(10)} ${
                    isGlobalRes ? "未知" : getUser(order.roomName)
                  }`;
                })
                .join("\n")
            );
          } catch (error) {
            return `查询市场资源信息失败`;
          }
        }
      );
  },
});
