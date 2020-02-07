phina.namespace(() => {

  phina.define("Enemy", {
    superClass: "DisplayElement",

    entered: false,
    killed: false,

    hp: 0,
    r: 0,

    bullet: null,
    type: null,

    init: function (params) {
      this.superInit();

      this.type = "air";
      this.pubTw = Tweener().attachTo(this);

      this.bullet = BulletML.Bullet.get();
      if (params.bulletml) {
        this.bulletml = AssetManager.get("xml", params.bulletml).data;
      }

      this.entered = false;
      this.killed = false;

      this.tweener
        .clear()
        .wait(params.wait)
        .call(() => this.start());
    },

    onremoved: function () {
      if (this.bullet) {
        this.bullet.destroy();
        this.bullet = null;
      }
    },

    start: function () {
    },

    pauseAttack: function () {
      if (this.bullet && this.bullet.runner) {
        this.bullet.runner.running = false;
      }
    },
    resumeAttack: function () {
      if (this.bullet && this.bullet.runner) {
        this.bullet.runner.running = true;
      }
    },

    update: function (app) {
      if (this.bullet) {
        this.bullet.x = this.x;
        this.bullet.y = this.y;
      }
      if (!this.entered && this.inScreen()) {
        this.entered = true;
        this.flare("enter");
      }
    },

    damage: function (power) {
      if (!this.entered) return false;

      this.hp -= power;
      const killed = this.hp <= 0;
      if (killed) {
        this.flare("killed");
      }

      return killed;
    },

    inScreen: function () {
      return 0 <= this.x && this.x < CANVAS_WIDTH && 0 <= this.y && this.y < CANVAS_HEIGHT;
    },
    inWorld: function () {
      return CANVAS_WIDTH * -0.2 <= this.x && this.x < CANVAS_WIDTH * 1.2 && CANVAS_HEIGHT * -0.2 <= this.y && this.y < CANVAS_HEIGHT * 1.2;
    },
  });

});
