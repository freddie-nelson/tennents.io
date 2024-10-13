import Vec2 from "./Vec2";

export default class Joystick {
  readonly container: HTMLDivElement;
  readonly knob: HTMLDivElement;

  private trackingTouchId: number | null = null;
  private direction = new Vec2(0, 0);

  constructor(readonly deadzone = 0.15, readonly onlyMaxStrength = true) {
    this.container = document.createElement("div");
    this.container.classList.add("joystick");

    this.knob = document.createElement("div");
    this.knob.classList.add("knob");

    this.container.appendChild(this.knob);

    this.container.addEventListener("touchstart", (e) => this.handleTouchStart(e));
    window.addEventListener("touchend", (e) => this.handleTouchEnd(e));
    window.addEventListener("touchmove", (e) => this.handleTouchMove(e));
  }

  show() {
    document.body.appendChild(this.container);
  }

  hide() {
    this.container.remove();
  }

  getDirectionX() {
    return this.direction.x;
  }

  getDirectionY() {
    return this.direction.y;
  }

  getDirection() {
    return this.direction.clone();
  }

  private handleTouchStart(e: TouchEvent) {
    if (this.trackingTouchId !== null) {
      return;
    }

    this.trackingTouchId = e.changedTouches[0].identifier;
  }

  private handleTouchEnd(e: TouchEvent) {
    if (
      this.trackingTouchId === null ||
      !Array.from(e.changedTouches).find((t) => t.identifier === this.trackingTouchId)
    ) {
      return;
    }

    this.trackingTouchId = null;

    this.direction = new Vec2(0, 0);
    this.updateTransform(this.direction);
  }

  private handleTouchMove(e: TouchEvent) {
    if (this.trackingTouchId === null) {
      return;
    }

    const touch = Array.from(e.touches).find((t) => t.identifier === this.trackingTouchId);
    if (!touch) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const radius = rect.width / 2;

    // touch pos relative to container
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // vector from center to touch
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;

    // distance from center
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < radius * this.deadzone) {
      this.direction = new Vec2(0, 0);
      this.updateTransform(this.direction);
      return;
    }

    this.direction = new Vec2(dx, dy).normalize();

    let v: Vec2;
    if (this.onlyMaxStrength) {
      v = this.direction.mul(radius);
    } else {
      v = this.direction.mul(Math.min(distance, radius));
    }

    this.updateTransform(v);
  }

  private updateTransform(v: Vec2) {
    this.knob.style.transform = `translate(${v.x}px, ${v.y}px)`;
  }
}
