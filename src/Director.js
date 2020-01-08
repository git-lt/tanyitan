import store from "./base/DataStore.js";
import { Block } from "./body/Block.js";
import { Border } from "./body/Border.js";
import { Aim } from "./body/Aim";
export class Director {
  constructor(physics) {
    this.physics = physics;
  }

  spriteLoad() {
    this.sprite = new Map();
    // this.sprite['score'] = new Score
  }

  spriteDirect(isReload) {}

  physicsDirect(isReload) {
    this.physics.Matter.Render.run(this.physics.render);
    console.log("init Matter Render");
    new Block(this.physics).draw();
    new Border(this.physics).draw();
    new Aim(this.physics);
  }
}
