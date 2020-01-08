// 全局状态
class DataStore {
  constructor() {
    this.map = new Map();

    // 资源
    this.res = null;
    // 是否结束
    this.isGameOver = false;
    // 游戏分数
    this.scoreCount = 0;
  }

  put(key, value) {
    if (typeof value === "function") {
      value = new value();
    }
    this.map.set(key, value);
  }

  get(key) {
    return this.map.get(key);
  }

  destory() {
    for (let value of this.map.values()) {
      value = null;
    }
  }
}
export default new DataStore();
