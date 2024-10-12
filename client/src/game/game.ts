import { Application } from "pixi.js";

export default class Game {
  public readonly app: Application;

  constructor() {
    this.app = new Application();
  }

  async init() {
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.app.resizeTo = window;

    document.body.appendChild(this.app.canvas);

    window.addEventListener("resize", () => {
      this.app.resize();
    });
  }
}
