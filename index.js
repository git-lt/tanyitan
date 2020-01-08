import decomp from "poly-decomp";
window.decomp = decomp;

const Matter = require("./src/base/matter.js");
const { Engine, Render } = Matter;
import { App } from "./App.js";
import bgImg from "./res/background.png";

const canvasW = 375;
const canvasH = 667;

const canvas = document.getElementById("app");
canvas.width = canvasW;
canvas.height = canvasH;

const engine = Engine.create({ enableSleeping: true });
const render = Render.create({
  canvas,
  engine,
  options: {
    width: canvasW,
    height: canvasH,
    // background: bgImg,
    background: "#18181D",
    wireframeBackground: "#292D3F",
    // 线框模式
    wireframes: false,
    // wireframes: true,
    // 刚体碰撞点
    howCollisions: true,
    // showPositions: true,
    // showIds: true,
    // 刚体转角指示
    showAngleIndicatior: true
    // showInternalEdges: false,
  }
});

Engine.run(engine);

const physics = { Matter, engine, canvas, render };

new App(physics);
