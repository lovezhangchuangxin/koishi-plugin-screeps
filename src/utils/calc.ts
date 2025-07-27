/**
 * GPL计算公式
 * @param power 已经烧的power数
 */
export const calculateGPL = (power: number) => {
  return Math.floor(Math.pow((power || 0) / 1000, 0.5));
};

/**
 * GCL计算公式
 * @param gcl 当前gcl数量
 */
export const calculateGCL = (gcl: number) => {
  return Math.floor(Math.pow((gcl || 0) / 1000000, 1 / 2.4)) + 1;
};

export const gent = (r: string) => {
  return [
    r + "H",
    r + "H2O",
    "X" + r + "H2O",
    r + "O",
    r + "HO2",
    "X" + r + "HO2",
  ];
};
