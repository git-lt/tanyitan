/**
 * 方块 圆形 三角形
 * 随机旋转一个角度
 * 大于20的数字，形状更大， 大于50的数字更大
 * 撞击后有抖动效果
 */
import store from "../base/DataStore";
const colors = ["#4a90e2", "#794ae2", "#a04ae2", "#e24a99", "#3cdbb0", "#db7c3c"];

export class Block {
  constructor(physics) {
    this.physics = physics;
    this.count = 5;
    this.map = {};
    this.HPMax = 10;
    this.timer = 0;
    this.score = 0;

    this.bindEvents();
  }

  draw() {
    const physics = this.physics;
    const { canvas, Matter, engine } = physics;
    const { Common, Bodies, World } = Matter;

    let lastBlockPositionX = 70;
    let lastBlockPositionY = 70;
    let blockArr = [];

    for (let i = 0; i < this.count; i++) {
      let hp = Math.floor(Common.random(1, this.HPMax));
      const x = lastBlockPositionX + i * 10;
      const y = canvas.height - lastBlockPositionY - Math.floor(Common.random(1, 30));
      let sides = Math.round(Common.random(3, 6));
      sides = sides === 4 ? 3 : sides;
      const randomColorIdx = Math.round(Common.random(0, 5));
      const options = {
        isStatic: true,
        chamfer: { radius: 4 },
        angle: Math.PI * Math.random(),
        render: {
          visible: true,
          fillStyle: colors[randomColorIdx],
          text: {
            content: hp,
            color: "white",
            size: 16,
            family: "Arial"
          }
        }
      };

      const block =
        Math.round(Common.random(0, 1)) < 0.8
          ? Bodies.rectangle(x, y, 30, 30, options)
          : Bodies.polygon(x, y, sides, Common.random(15, 25), options);

      block.hp = hp;
      lastBlockPositionX += 50;
      blockArr.push(block);
      block.isNumber = true;
      this.map[block.id] = block;
    }
    World.add(engine.world, blockArr);
    return this;
  }

  onUpdate = () => {
    const physics = this.physics;
    const { Matter, engine } = physics;
    const { Events, Body, Common } = Matter;

    for (let id in this.map) {
      let block = this.map[id];
      if (!block) return;

      Body.setPosition(block, {
        x: block.position.x,
        y: block.position.y
      });

      if (block.position.y < 90) {
        window.alert("游戏结束，得分：" + this.score);
        store.isGameOver = true;
        this.map = {};
        this.score = 0;
        Events.off(engine, "beforeUpdate");
      }
    }

    // 绘制新方块
    if (this.timer > 0 && this.timer % 800 === 0) {
      // 广场上移 50
      Object.keys(this.map).forEach(v => {
        let item = this.map[v];
        Body.setPosition(item, {
          x: item.position.x,
          y: item.position.y - 100
        });
      });

      this.HPMax += Common.random(4, 10);
      this.draw();
    }
    this.timer++;
  };

  // 撞击
  onCollision = e => {
    const { Matter, engine } = this.physics;

    const pairs = e.pairs;

    for (let p of pairs) {
      const hasNumberBox = p.bodyA.isNumber || p.bodyB.isNumber;
      if (!hasNumberBox) return;
      let curr = p.bodyA.isNumber ? p.bodyA : p.bodyB;
      curr.hp--;
      engine.world.gravity.y = 1;
      curr.render.text.content = curr.hp;

      // 给小球一个反向作用力，防止小球落到方块上后失去运动力
      if (Math.abs(curr.velocity.y) < 1) {
        Matter.Body.setVelocity(curr, { x: Math.random() * 10 - 8, y: -0.3 });
      }

      if (curr.hp <= 0) {
        Matter.World.remove(engine.world, curr);
        delete this.map[curr.id];
        // 加 1 分
        this.score++;
        console.log("得分：" + this.score);
      }
    }
  };

  bindEvents = () => {
    const { Matter, engine } = this.physics;

    Matter.Events.on(engine, "beforeUpdate", this.onUpdate);
    Matter.Events.on(engine, "collisionStart", this.onCollision);
  };
}
