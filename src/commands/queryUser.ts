import { calculateGCL, calculateGPL } from "../utils";
import { defineCommand } from "./types";

export default defineCommand({
  name: "user",
  register(ctx, api) {
    ctx
      .command("user <username>", "查询玩家信息")
      .option("top", "-t 最高排名")
      .alias("查询玩家", "玩家信息", "玩家")
      .action(async ({ options }, username: string) => {
        if (!username) {
          return "请提供想查询的用户名";
        }

        // 玩家名不能带有中文
        if (/[\u4e00-\u9fa5]/.test(username)) {
          return;
        }

        // 查找该玩家id
        const userInfo = await api.getUserInfoByUserName(username);
        if (!userInfo.ok || !userInfo.user) {
          return `未找到该玩家：${username} ${userInfo.error}`;
        }

        const gcl = calculateGCL(userInfo.user.gcl);
        const gpl = calculateGPL(userInfo.user.power);
        let worldRank = 0;
        let powerRank = 0;
        let time = 0;
        await Promise.all([
          api.getRank(username, "world"),
          api.getRank(username, "power"),
        ]).then((responses) => {
          if (options.top) {
            responses[0].list?.sort((a, b) => b.rank - a.rank);
            responses[1].list?.sort((a, b) => b.rank - a.rank);
          }
          worldRank = responses[0].ok ? responses[0].list.pop()?.rank + 1 : 0;
          powerRank = responses[1].ok ? responses[1].list.pop()?.rank + 1 : 0;

          time = Math.max(
            responses[0].list.filter((item) => item.score).length,
            responses[1].list.filter((item) => item.score).length
          );
        });

        return `玩家信息${options.top ? "(最高排名)" : "(最近排名)"}：
- 名称: ${userInfo.user.username}
- 经营时间: ${time}月 
- GCL: ${gcl} (世界排名: ${worldRank || "未上榜"})
- GPL: ${gpl} (抛瓦排名: ${powerRank || "未上榜"})`;
      });
  },
});
