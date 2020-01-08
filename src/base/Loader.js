export class Loader {
  constructor() {
    this.list = [];
    this.sprites = new Map();
  }

  add(resList) {
    this.count = resList.length;
    this.list = resList;
    return this;
  }

  load(cb) {
    let count = 0;
    for (let [key, src] of this.list) {
      const suffix = src.split(".").pop();
      const isImg = /jpg|png|jpeg$/i.test(suffix);
      let res = isImg ? new Image() : new Audio();
      res.src = src;
      isImg && count++;

      this.sprites.set(key, res);

      // 只有 image 类型有onload回调
      res.onload = () => {
        count--;
        count === 0 && cb(this.sprites);
      };
    }
  }
}
