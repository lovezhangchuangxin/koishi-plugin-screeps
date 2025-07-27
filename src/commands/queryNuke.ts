import { IMapStats, Shard } from "screeps-simple-api";
import { defineCommand } from "./types";

export default defineCommand({
  name: "nuke",
  register: (ctx, api) => {
    ctx
      .command("nuke <shard>", "查询核弹信息，默认shard3")
      .alias("核弹", "查核弹", "查询核弹")
      .action(async (_, targetShard: string) => {
        const nukeInfo = await api.getNukes();
        if (!nukeInfo.ok) {
          return `核弹信息查询失败: ${nukeInfo.error}`;
        }

        targetShard ||= "shard3";
        const resList: Promise<[string, IMapStats]>[] = [];
        Object.entries(nukeInfo.nukes).forEach(([shard, nukes]) => {
          if (targetShard !== "all" && shard !== targetShard) return;

          const rooms = Array.from(
            new Set(
              nukes
                .map(({ room, launchRoomName }) => [room, launchRoomName])
                .flat()
            )
          );
          resList.push(
            new Promise(async (resolve, reject) => {
              const res = await api.getMapStats(
                rooms,
                shard as Shard,
                "owner0"
              );
              if (res.ok) {
                resolve([shard, res]);
                return;
              }

              reject(res.error);
            })
          );
        });

        return await Promise.all(resList).then((responses) => {
          const result = responses
            .map(([shard, res]) => {
              const nukes = nukeInfo.nukes[shard as Shard] || [];
              const o = (room: string) => {
                return res.users[res.stats[room].own.user]?.username || "未知";
              };
              return (
                `${shard}:\n` +
                nukes
                  .map((nuke) => {
                    return `${o(nuke.launchRoomName)} ${
                      nuke.launchRoomName
                    } -> ${o(nuke.room)} ${nuke.room}`;
                  })
                  .join("\n")
              );
            })
            .join("\n\n");

          return result || "没有核弹信息";
        });
      });
  },
});
