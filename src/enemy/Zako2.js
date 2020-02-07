phina.namespace(() => {

  let TEXTURE = null;

  phina.define("Zako2", {
    superClass: "Enemy",

    init: function (params) {
      this.superInit(({}).$extend({}, params));

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(2, 2222);

      this.hp = 3;
      this.r = 20;
      this.a = Vector2(0, 0);
      this.v = Vector2(0, 3);

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
        this.flare("effect", { type: "smallExplosion" });
      });
    },

    start: function () {
      this.on("enterframe", () => {
        this.a.set(Fighter.instance.x - this.x, Fighter.instance.y - this.y).normalize();
        const angle = this.a.toDegree();
        if (180 <= angle && angle < 270) {
          this.a.fromDegree(180);
        } else if (270 <= angle && angle < 360) {
          this.a.fromDegree(0);
        }
        this.v.add(this.a.mul(0.3)).normalize().mul(7);

        this.position.add(this.v);
        this.rotation = 90 + angle;

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
