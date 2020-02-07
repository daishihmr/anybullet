phina.namespace(() => {

  let TEXTURE = null;

  phina.define("TankSmall", {
    superClass: "Enemy",

    init: function (params) {
      params = ({}).$extend({
        speed: 0.75,
      }, params);
      this.superInit(params);

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(2, 3333);

      this.hp = 8;
      this.r = 20;
      this.type = "ground";
      this.vx = Math.cos(params.direction) * params.speed;
      this.vy = Math.sin(params.direction) * params.speed;
      this.rotation = 90 + params.direction.toDegree();

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
        this.x += this.vx;
        this.y += this.vy;

        if (this.entered && !this.inWorld) {
          this.remove();
        }
      });
    },
  });
});
