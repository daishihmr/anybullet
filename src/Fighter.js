phina.namespace(() => {

  const SPEED = 0.3;
  const SPEED_SLOW = SPEED * 0.5;
  const HEAT_BY_FIRE = 100;

  const controller = {
    moveDelta: Vector2(0, 0),
    fire: false,
    bomb: false,
    slow: false,
  };

  phina.define("Fighter", {
    superClass: "GLSprite",

    _static: {
      instance: null,
    },

    init: function (params) {
      this.superInit({
        spriteArray: params.spriteArray,
        image: "fighterC4.png",
      });

      Fighter.instance = this;

      this.r = 0;
      this.boundingType = "circle";
      this.controllable = false;
      this._muteki = true;
      this.heat = 0;

      this.controlMode = "keyboard";
    },

    update: function (app) {
      if (this.controllable) {
        const dt = app.deltaTime;

        if (app.controlMode == "gamepad") {
          const gp = app.gamepads.get();
          const ls = gp.getStickDirection();

          controller.moveDelta.x = Math.round(ls.x);
          controller.moveDelta.y = Math.round(ls.y);
          controller.fire = gp.getKey("r2") || gp.getKey("x");
          controller.slow = gp.getKey("a");
        } else if (app.controlMode == "keyboard") {
          const kb = app.keyboard;

          controller.moveDelta.x = (kb.getKey("a") || kb.getKey("left")) ? -1 : (kb.getKey("d") || kb.getKey("right")) ? 1 : 0
          controller.moveDelta.y = (kb.getKey("w") || kb.getKey("up")) ? -1 : (kb.getKey("s") || kb.getKey("down")) ? 1 : 0
          controller.fire = kb.getKey("z");
          controller.slow = kb.getKey("shift");
        }

        controller.moveDelta.normalize();
        const speed = controller.slow ? SPEED_SLOW : SPEED;

        this.position.x += controller.moveDelta.x * speed * dt;
        this.position.y += controller.moveDelta.y * speed * dt;
        this.position.x = Math.clamp(this.position.x, SCREEN_X + 10, SCREEN_X + SCREEN_W - 10);
        this.position.y = Math.clamp(this.position.y, SCREEN_Y + 10, SCREEN_Y + SCREEN_H - 10);

        if (controller.fire && this.heat <= 0) {
          if (controller.slow) {
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.02, pos: { x: -24, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.01, pos: { x: -16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: -6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: 6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.01, pos: { x: 16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.02, pos: { x: 24, y: 20 } });
          } else {
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.2, pos: { x: -24, y: 28 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.1, pos: { x: -16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: -6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: 6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.1, pos: { x: 16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.2, pos: { x: 24, y: 28 } });
          }
          this.heat = HEAT_BY_FIRE;
        }

        this.heat -= dt;
      } else {
        this.heat = 0;
      }
    },

    launch: function () {
      this.tweener
        .clear()
        .set({
          visible: true,
          x: SCREEN_X + SCREEN_W * 0.2,
          y: SCREEN_Y + SCREEN_H * 1.2,
          controllable: false,
          muteki: true,
        })
        .wait(1000)
        .to({
          y: SCREEN_Y + SCREEN_H * 0.9,
        }, 800, "easeOutBack")
        .set({
          controllable: true,
        })
        .wait(1000)
        .set({
          muteki: false,
        });

      return this;
    },

    damage: function (power) {
      // this.killed();
    },

    killed: function () {
      this.controllable = false;
      this.muteki = true;
      this.flare("killed");
    },

    _accessor: {
      muteki: {
        get: function () {
          return this._muteki;
        },
        set: function (v) {
          this._muteki = v;
        },
      }
    }
  });

});
