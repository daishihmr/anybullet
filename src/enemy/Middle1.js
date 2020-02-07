phina.namespace(() => {

  let TEXTURE = null;

  phina.define("Middle1", {
    superClass: "Enemy",

    init: function (params) {
      this.superInit(({}).$extend({}, params));

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(3, 4444);

      this.hp = 15;
      this.r = 30;
      this.toX = params.toX + CANVAS_WIDTH * 0.5;

      this.fromJSON({
        children: {
          body: {
            className: "Sprite",
            arguments: [TEXTURE],
          },
        },
      });

      this.on("enter", () => this.flare("attack"));

      this.on("killed", () => {
        this.flare("effect", { type: "middleExplosion" });
      });
    },

    start: function () {
      this.tweener
        .clear()
        .to({
          x: this.toX,
        }, 2000, "easeOutQuad");

      this.on("enterframe", () => {
        this.y += 1.2;

        if (Fighter.instance.y < this.y) {
          this.pauseAttack();
        } else {
          this.resumeAttack();
        }

        if (this.entered && !this.inWorld()) {
          this.remove();
        }
      });
    },
  });

});
