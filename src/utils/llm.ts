export const chat = async (content: string) => {
  const data = {
    model: "screeps",
    messages: [{ role: "user", content }],
    stream: false, // 是否启用流式响应
    options: {
      // 可选参数
      temperature: 0.7,
      max_tokens: 500,
    },
  };

  return await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  }).then((res) => res.json());
};
