// 围墙
export class Border {
  constructor(physics) {
    this.physics = physics;
    this.borderWidth = 10;
    this.bottomId = null;

    this.bindEvents();
  }

  draw() {
    const physics = this.physics;
    const { canvas, Matter, engine } = physics;
    const { Bodies, World, Vertices, Svg } = Matter;
    const { width: canvasW, height: canvasH } = canvas;
    const rectOption = { isStatic: true, render: { visible: true, fillStyle: "#adadfd" } };

    const triangle = Vertices.fromPath([0, canvasH, canvasW / 2, canvasH - 45, canvasW, canvasH].join(","));

    // 底部三角
    const bottomBlock = Bodies.fromVertices(canvasW / 2, canvasH - 14, triangle, rectOption);

    // 左挡板
    const leftBlock = Bodies.rectangle(30, canvasH / 2 - 30, 2, canvasH - 10, rectOption);
    // 右挡板
    const rightBlock = Bodies.rectangle(canvasW - 30, canvasH / 2 - 30, 2, canvasH - 10, rectOption);

    const leftWall = Bodies.rectangle(0, canvasH / 2, 2, canvasH, {
      isStatic: true,
      render: {
        visible: true
      }
    });
    const rightWall = Bodies.rectangle(canvasW - 2, canvasH / 2, 2, canvasH, {
      isStatic: true,
      render: {
        visible: true
      }
    });

    // 顶部 挡板
    const topLeft = Bodies.rectangle(canvasW / 2 - 80, 50, (canvasW - 20 * 2 - 20) / 2, 4, {
      isStatic: true,
      angle: Math.PI * 0.08,
      render: {
        fillStyle: "#575375"
      }
    });
    const topRight = Bodies.rectangle(canvasW / 2 + 80, 50, (canvasW - 20 * 2 - 20) / 2, 4, {
      isStatic: true,
      angle: -Math.PI * 0.08,
      render: {
        visible: true,
        fillStyle: "#575375"
      }
    });

    // 安全线
    var safeLine = Bodies.rectangle(canvasW / 2, 100, canvasW - 32 * 2, 0.5, {
      isSensor: true,
      isStatic: true,
      render: {
        visible: true,
        fillStyle: "#C7F464"
      }
    });

    this.bottomId = bottomBlock.id;
    World.add(engine.world, [bottomBlock, leftBlock, rightBlock, topLeft, topRight, safeLine, leftWall, rightWall]);
  }

  onCollision = e => {
    const pairs = e.pairs;
    const gravity = this.physics.engine.world.gravity.y;
    if (gravity === 1) return;

    const hasBottom = pairs.some(v => v.bodyA.id === this.bottomId);
    if (hasBottom) this.physics.engine.world.gravity.y = 1;
  };

  bindEvents = () => {
    const physics = this.physics;
    const { Matter, engine } = physics;

    Matter.Events.on(engine, "collisionStart", this.onCollision);
  };
}
