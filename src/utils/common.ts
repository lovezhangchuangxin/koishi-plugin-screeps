import { CanvasRenderingContext2D } from "canvas";

/**
 * 使用指定颜色在指定位置绘制文字
 * @param ctx canvas context
 * @param text 文字
 * @param x x坐标
 * @param y y坐标
 * @param color 颜色
 */
export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

/**
 * 分割一个数字为字符串
 * @param num 数字
 */
export const splitNum = (num: number) => {
  if (num < 1000) return num.toString();
  let str = "";
  str += (num % 1000).toString().padStart(3, "0");
  num = Math.floor(num / 1000);
  while (num) {
    if (num < 1000) {
      str = num + "," + str;
      break;
    }
    str = (num % 1000).toString().padStart(3, "0") + "," + str;
    num = Math.floor(num / 1000);
  }
  return str;
};
