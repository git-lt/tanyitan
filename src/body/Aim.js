import store from "../base/DataStore";
/**
 * 瞄准 白色小点，远近不同，两边有边界
 */
export class Aim {
  constructor(physics) {
    this.physics = physics;
    this.ballRadius = 10; // 球的半径

    this.baseBallX = this.physics.canvas.width / 2;
    this.baseBallY = this.ballRadius * 2 + 65;
    this.x = physics.canvas.width / 2;
    this.y = physics.canvas.height / 2;

    // 准星
    this.aimSize = 5;
    this.balls = [];
    this.ballCount = 7;

    // 球子弹
    this.ballAppends = [];
    this.ballAppendCount = 10;
    this.recycleIdxArr = [];

    this.isShooting = false;
    this.isAiming = false;

    this.intervalMax = 100;

    this.minX = 38 + this.ballRadius;
    this.maxX = this.physics.canvas.width - 38 - this.ballRadius;

    this.initBalls();
    this.bindEvents();
    this.drawAim();
  }

  initBalls() {
    const { Matter } = this.physics;
    const { Bodies, Common } = Matter;

    for (let i = 0; i < this.ballAppendCount; i++) {
      const ball = Bodies.circle(Common.random(this.minX, this.maxX), -this.ballRadius / 2, this.ballRadius, {
        isStatic: false,
        density: 0.045,
        friction: 0.05,
        frictionAir: 0.00001,
        restitution: 0.9,
        render: {
          visible: true,
          fillStyle: "#F35e66",
          strokeStyle: "black"
        }
      });
      ball.isBall = true;
      this.ballAppends.push(ball);
      Matter.World.add(this.physics.engine.world, ball);
    }
  }

  // 瞄准线
  drawAim() {
    console.log("drawAim");
    this.isShooting = false;
    this.isAiming = true;

    const { Matter, engine } = this.physics;
    const { Bodies, World } = Matter;

    World.remove(engine.world, this.balls);
    this.balls = [];

    for (let i = 0; i < this.ballCount; i++) {
      const x = Math.floor(this.baseBallX + ((this.x - this.baseBallX) * i) / (this.ballCount - 1));
      const y = Math.floor(this.baseBallY + ((this.y - this.baseBallY) * i) / (this.ballCount - 1));

      const ball = Bodies.circle(x, y, this.aimSize, {
        isStatic: true,
        density: 0.04,
        friction: 0.001,
        frictionAir: 0.00001,
        frictionStatic: 0.2,
        restitution: 0.9,
        render: {
          visible: true,
          fillStyle: "#ffffff",
          strokeStyle: "black"
        }
      });
      this.balls.push(ball);
    }
    World.add(engine.world, this.balls);
  }

  // 发射的小球
  drawBall() {
    console.log("drawBall");
    const { Matter, canvas, engine } = this.physics;
    const { Body, World } = Matter;

    World.remove(engine.world, this.balls);
    this.balls = [];

    this.isShooting = true;
    this.isAiming = false;

    this.intervalCount = 0;
    this.recycleIdxArr = [];
    engine.world.gravity.y = 0;

    // 从最底部开始拿小球
    this.ballAppends.sort((a, b) => b.position.y - a.position.y);
    const interval = setInterval(() => {
      if (this.intervalCount < this.ballAppendCount) {
        const ballAppend = this.ballAppends[this.intervalCount];
        Body.setPosition(ballAppend, { x: this.baseBallX, y: this.baseBallY });

        const speed = { x: (this.x - this.baseBallX) / (this.y - this.baseBallY), y: 1 };

        const fixRate =
          (Math.sqrt(Math.pow(speed.x, 2) + Math.pow(speed.y, 2)) / Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2))) *
          1000;
        Body.applyForce(ballAppend, ballAppend.position, {
          x: (speed.x / fixRate) * 0.7,
          y: (speed.y / fixRate) * 0.7
        });

        this.intervalCount++;
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  onUpdate = () => {
    const { Matter } = this.physics;
    if (!this.ballAppends.length) return;

    this.ballAppends.forEach((v, i) => {
      // 回收小球
      if (!this.recycleIdxArr.includes(i) && this.isCanRecycle(v)) {
        // 设置向量力度 （速度)
        Matter.Body.setVelocity(v, { x: 0, y: -40 });
        // 设置起点
        Matter.Body.setPosition(v, { ...v.position });
        this.recycleIdxArr.push(i);
      }

      // 重置小球
      if (this.recycleIdxArr.includes(i) && this.isCanInit(v)) {
        // 设置向量力度 （速度)
        Matter.Body.setVelocity(v, { x: 0, y: 0 });
        // 设置起点
        Matter.Body.setPosition(v, { x: Matter.Common.random(this.minX, this.maxX), y: 10 });
      }
    });

    if (this.isShooting) {
      // 有 80% 的球静止时，就可以瞄准了
      const isWorldSleeping = this.ballAppends.filter(v => v.isSleeping).length / this.ballAppendCount > 0.8;
      if (isWorldSleeping && this.recycleIdxArr.length === this.ballAppendCount) {
        console.log("重置瞄准器");
        this.drawAim();
      }
    }
  };

  bindEvents() {
    const { Matter, canvas, engine } = this.physics;
    canvas.addEventListener("mousemove", e => {
      if (this.isAiming) {
        this.x = e.offsetX;
        this.y = Math.max(50, e.offsetY);
        this.drawAim();
        return;
      }
    });
    canvas.addEventListener("mouseup", e => {
      e.preventDefault();
      if (this.isAiming) {
        this.drawBall();
      }
    });

    Matter.Events.on(engine, "beforeUpdate", this.onUpdate);
  }

  // 是否可以回收
  isCanRecycle = ball => {
    const { canvas } = this.physics;
    const { x, y } = ball.position;
    if ((x <= 20 || x >= canvas.width - 20) && y >= canvas.height - 40) {
      return true;
    }
  };

  isCanInit = ball => {
    return ball.position.y < 0;
  };
}
