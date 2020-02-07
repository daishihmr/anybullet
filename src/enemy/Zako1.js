phina.namespace(() => {

  let TEXTURE = null;

  phina.define("Zako1", {
    superClass: "Enemy",

    init: function (params) {
      this.superInit(({}).$extend({}, params));

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(2, 1111);

      this.hp = 3;
      this.r = 20;

      this.fromJSON({
        children: {
          body: {
            className: "AtlasSprite",
            arguments: {
              atlas: "enemies",
              frame: "heri1_1.png",
            },
          },
        },
      });

      this.on("killed", () => {
        this.flare("effect", { type: "smallExplosion" });
      });
    },

    start: function () {
      this.tweener
        .clear()
        .by({
          y: 500
        }, 1500, "easeOutQuad")
        .call(() => this.flare("attack"))
        .wait(1000)
        .by({
          y: -500
        }, 1500, "easeInQuad")
        .call(() => this.remove());

      this.odd = true;
      this.on("enterframe", (e) => {
        this.body.scaleX = Fighter.instance.x < this.x ? 1 : -1;
        if (this.odd) {
          this.body.setFrame("heri1_1.png");
        } else {
          this.body.setFrame("heri1_2.png");
        }
        this.odd = !this.odd;
      });
    },
  });

});
