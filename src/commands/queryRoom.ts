import { Controller, Shard } from "screeps-simple-api";
import { defineCommand } from "./types";
import { CONTROLLER_LEVELS } from "../utils";

export default defineCommand({
  name: "room",
  register(ctx, api) {
    ctx
      .command("room <room> <shard>", "查询房间信息")
      .alias("房间", "查房间", "查询房间")
      .action(async (_, roomName: string, targetShard: string) => {
        if (!roomName) {
          return "请提供想查询的房间名称";
        }

        roomName = roomName.toUpperCase();
        targetShard ||= "shard3";
        if (!["shard0", "shard1", "shard2", "shard3"].includes(targetShard)) {
          return "无效的shard";
        }

        const res = await api.getRoomObject(roomName, targetShard as Shard);
        if (!res.ok) {
          return `查询房间信息失败: ${res.error}`;
        }

        const controller = res.objects.find((obj) => obj.type === "controller");
        if (!controller) {
          return `房间 ${roomName} 不存在控制器`;
        }

        if (!controller.user || !controller.level) {
          return `房间 ${roomName} 为无主房间`;
        }

        const creeps = res.objects.filter((obj) => obj.type === "creep");
        const walls = res.objects.filter(
          (obj) => obj.type === "constructedWall" || obj.type === "rampart"
        );
        const storage = res.objects.find((obj) => obj.type === "storage");
        const terminal = res.objects.find((obj) => obj.type === "terminal");
        const maxHitWall = Math.max(...walls.map((wall) => wall.hits));
        const avgHitWall =
          walls.reduce((sum, wall) => sum + wall.hits, 0) / walls.length;

        let result = `${targetShard} ${roomName} 房间信息: \n`;
        if (controller) {
          result += `- 控制器等级: ${controller.level} ${
            controller.level < 8
              ? `进度: ${(
                  (controller.progress / CONTROLLER_LEVELS[controller.level]) *
                  100
                ).toFixed(2)}%`
              : ""
          }\n`;
        }
        if (creeps.length) {
          result += `- 爬爬数量: ${creeps.length}\n`;
        }
        if (storage) {
          const amount = Object.values(storage.store).reduce(
            (sum, val) => sum + val,
            0
          );
          result += `- 仓库利用率: ${(
            (amount / storage.storeCapacity) *
            100
          ).toFixed(2)}%\n`;
        }
        if (terminal) {
          const amount = Object.values(terminal.store).reduce(
            (sum, val) => sum + val,
            0
          );
          result += `- 终端利用率: ${(
            (amount / terminal.storeCapacity) *
            100
          ).toFixed(2)}%\n`;
        }
        if (walls.length) {
          result += `- 墙体数量: ${walls.length}，最大血量: ${(
            maxHitWall / 1e6
          ).toFixed(2)}m，平均血量: ${(avgHitWall / 1e6).toFixed(2)}m\n`;
        }

        return result.trim();
      });
  },
});
