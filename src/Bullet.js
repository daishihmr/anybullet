phina.namespace(() => {

  phina.define("Bullet", {
    superClass: "GLSprite",

    init: function (params) {
      this.superInit({
        spriteArray: params.spriteArray,
        image: "bullet0.png",
      });

      this.bullet = null;
      this.power = 0;
      this.r = 0;
      this.dummy = false;

      this.setScale(0.5, 0.5);
      this.brightness = 1.5;
    },

    update: function () {
      this.x = this.bullet.x;
      this.y = this.bullet.y;
      this.rotation += 10;
      if (this.x < CANVAS_WIDTH * -0.1 || CANVAS_WIDTH * 1.1 <= this.x || this.y < CANVAS_HEIGHT * -0.1 || CANVAS_HEIGHT * 1.1 <= this.y) {
        this.remove();
      }
    },

    setBullet: function (bullet, spec) {
      this.x = bullet.x;
      this.y = bullet.y;

      this.bullet = bullet;
      this.bullet.onVanish = () => this.remove();

      this.power = 1;
      this.r = 12;

      this.dummy = false;
      this.visible = true;

      if (spec.label) {
        if (spec.label.startsWith("dummy")) {
          this.dummy = true;
          this.visible = false;
        } else {
          this.setImage(spec.label);
        }
      }
    },

    onremoved: function () {
      this.bullet.destroy();
      this.bullet = null;
    },
  });

});
