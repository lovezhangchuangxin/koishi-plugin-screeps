import { chat } from "../utils/llm";
import { defineCommand } from "./types";

export default defineCommand({
  name: "chat",
  register(ctx) {
    ctx
      .command("chat <content>", "与AI聊天")
      .alias("聊天")
      .action(async (_, content: string) => {
        if (!content) {
          return "请提供聊天内容";
        }

        try {
          const res = await chat(content);
          return res?.message?.content;
        } catch (error) {
          return `发生错误: ${error.message}`;
        }
      });
  },
});
