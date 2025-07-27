// 查询资源

import { createCanvas } from "canvas";
import { IRoomObjects, Shard } from "screeps-simple-api";
import {
  barsRes,
  baseRes,
  b_blueRes,
  b_greenRes,
  b_greyRes,
  b_pinkRes,
  b_witheRes,
  b_yellowRes,
  c_blueRes,
  c_greenRes,
  c_greyRes,
  c_pinkRes,
  c_yellowRes,
  powerRes,
  RES_COLOR_MAP,
  drawText,
  splitNum,
} from "../utils";
import { defineCommand } from "./types";
import { h } from "koishi";
import { getResourcePrice } from "../data/updateMarket";

export default defineCommand({
  name: "res",
  register(context, api) {
    context
      .command("res <user> <shard>", "查询资源信息")
      .alias("资源")
      .alias("查资源")
      .alias("查询资源")
      .action(async (_, username: string, targetShard: Shard) => {
        if (!username) {
          return "请提供想查询资源的用户名";
        }

        if (
          targetShard &&
          !["shard0", "shard1", "shard2", "shard3"].includes(targetShard)
        ) {
          return "无效的shard";
        }

        // 查找该玩家id
        const userInfo = await api.getUserInfoByUserName(username);
        if (!userInfo.ok || !userInfo.user) {
          return `未找到该玩家：${username} ${userInfo.error}`;
        }
        const roomsInfo = await api.getRooms(userInfo.user._id);
        if (!roomsInfo.ok) {
          return "未找到该玩家房间信息";
        }

        const requests: Promise<[string, Shard, IRoomObjects]>[] = [];
        const resStats: {
          [key: string]: number;
        } = {};
        const roomResStats: {
          [room: string]: {
            [key: string]: number;
          };
        } = {};
        for (const shardName in roomsInfo.shards) {
          const shard = shardName as Shard;
          if (targetShard && shard !== targetShard) continue;
          for (const room of roomsInfo.shards[shard]) {
            // 请求该房间对象
            requests.push(
              new Promise(async (resolve, reject) => {
                const res = await api.getRoomObject(room, shard);
                if (res.ok) {
                  resolve([room, shard, res]);
                } else {
                  reject(res.error);
                }
              })
            );
          }
        }

        try {
          return await Promise.all(requests).then(async (responses) => {
            for (const [room, shard, res] of responses) {
              const roomRes: { [key: string]: number } = {};

              for (const object of res.objects) {
                if (
                  object.type !== "storage" &&
                  object.type !== "terminal" &&
                  object.type !== "factory"
                )
                  continue;
                for (const resType in object.store) {
                  const type = resType;
                  const id = `${shard}-${type}`;
                  resStats[type] = (resStats[type] || 0) + object.store[type];
                  roomRes[id] = (roomRes[id] || 0) + object.store[type];
                }
              }

              roomResStats[`${shard}-${room}`] = roomRes;
            }

            // 绘图
            const gap = 100;
            const width = 9 * gap;
            const height = 520;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#2b2b2b";
            ctx.fillRect(0, 0, width, height);
            ctx.font = "14px";

            drawText(ctx, "baseRes", 10, 15, "#fff");
            baseRes.forEach((type, index) => {
              drawText(
                ctx,
                `${type}\n${splitNum(resStats[type] || 0)}`,
                30 + index * gap,
                30,
                RES_COLOR_MAP[type]
              );
            });

            drawText(ctx, "barsRes", 10, 65, "#fff");
            barsRes.forEach((type, index) => {
              drawText(
                ctx,
                `${type}\n${splitNum(resStats[type] || 0)}`,
                30 + index * gap,
                80,
                RES_COLOR_MAP[type]
              );
            });

            drawText(ctx, "powerRes", 10, 115, "#fff");
            powerRes.forEach((type, index) => {
              drawText(
                ctx,
                `${type}\n${splitNum(resStats[type] || 0)}`,
                30 + index * gap,
                130,
                RES_COLOR_MAP[type]
              );
            });

            drawText(ctx, "goods", 10, 165, "#fff");
            for (const [y, res] of [
              c_greyRes,
              c_blueRes,
              c_yellowRes,
              c_pinkRes,
              c_greenRes,
            ].entries()) {
              res.forEach((type, index) => {
                drawText(
                  ctx,
                  `${type}\n${splitNum(resStats[type] || 0)}`,
                  30 + index * gap,
                  180 + y * 30,
                  RES_COLOR_MAP[type]
                );
              });
            }

            drawText(ctx, "labRes", 10, 335, "#fff");
            for (const [y, res] of [
              b_greyRes,
              b_blueRes,
              b_yellowRes,
              b_pinkRes,
              b_greenRes,
              b_witheRes,
            ].entries()) {
              res.forEach((type, index) => {
                drawText(
                  ctx,
                  `${type}\n${splitNum(resStats[type] || 0)}`,
                  30 + index * gap,
                  350 + y * 30,
                  RES_COLOR_MAP[type]
                );
              });
            }

            drawText(ctx, new Date().toLocaleString(), 680, 400, "#888");
            drawText(
              ctx,
              `${username} ${targetShard || "all shard"}`,
              680,
              420,
              "#888"
            );

            let totalValue = 0;
            let maxValueRoom = "";
            let maxValue = 0;
            await Promise.all(
              Object.entries(roomResStats).map(async ([roomId, stats]) => {
                const [shard] = roomId.split("-");
                let value = 0;
                for (const [id, count] of Object.entries(stats)) {
                  const [_, resourceType] = id.split("-");
                  const price = await getResourcePrice(
                    context,
                    shard as Shard,
                    resourceType
                  );
                  value += count * (price || 0);
                }
                totalValue += value;
                if (value > maxValue) {
                  maxValue = value;
                  maxValueRoom = roomId;
                }
              })
            );

            drawText(
              ctx,
              `总价值: ${splitNum(Math.floor(totalValue))}`,
              680,
              440,
              "#888"
            );
            drawText(
              ctx,
              `最高价值房间: ${maxValueRoom}\n (${splitNum(
                Math.floor(maxValue)
              )})`,
              680,
              460,
              "#888"
            );

            const buf = canvas.toBuffer("image/png");
            return h.image(buf, "image/png");
          });
        } catch (error) {
          return "查询失败，请稍后再试";
        }
      });
  },
});
