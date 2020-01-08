import { Loader } from "./src/base/Loader.js";
import store from "./src/base/DataStore.js";
import { Director } from "./src/Director.js";
import resourceList from "./src/base/resource.js";

export class App {
  constructor(options) {
    this.canvas = options.canvas;
    this.physics = { ...options, ctx: options.canvas.getContext("2d") };
    this.director = new Director(this.physics);

    new Loader().add(resourceList).load(res => {
      console.log(res);
      this.run();
    });
  }

  run() {
    this.bindEvents();
    this.director.physicsDirect();
  }

  reload() {}

  bindEvents() {
    this.canvas.addEventListener("touchstart", this.restart);
    this.canvas.addEventListener("mousedown", this.restart);
  }

  restart = e => {
    e.preventDefault();
    if (store.isGameOver) {
      store.isGameOver = false;
      this.reload();
    }
  };
}
