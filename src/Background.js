phina.namespace(() => {

  phina.define("Background", {
    superClass: "DisplayElement",

    init: function (params) {
      this.superInit();

      this.speed = params.speed;
      const spriteArray = params.spriteArray;

      this.fromJSON({
        children: Array.range(0, 9).map(() => {
          return {
            className: "GLSprite",
            arguments: {
              spriteArray,
              image: "bg.png",
            },
            scaleX: 512 / 1024, scaleY: 512 / 1024,
            z: 20,
          };
        }),
      });

      this.scrollX = 0;
      this.scrollY = 0;
      this.vx = 0;
      this.vy = 0;
    },

    update: function() {
      this.scrollX += this.vx * this.speed;
      this.scrollY += this.vy * this.speed;
    },

    _accessor: {
      scrollX: {
        get: function () {
          return this._scrollX;
        },
        set: function (v) {
          this._scrollX = v;
          const base = CANVAS_WIDTH * 0.5 + this._scrollX % 512;
          this.children[0].x = base + 512 * -1;
          this.children[1].x = base + 512 * 0;
          this.children[2].x = base + 512 * 1;
          this.children[3].x = base + 512 * -1;
          this.children[4].x = base + 512 * 0;
          this.children[5].x = base + 512 * 1;
          this.children[6].x = base + 512 * -1;
          this.children[7].x = base + 512 * 0;
          this.children[8].x = base + 512 * 1;
        },
      },
      scrollY: {
        get: function () {
          return this._scrollY;
        },
        set: function (v) {
          this._scrollY = v;
          const base = CANVAS_HEIGHT * 0.5 + this._scrollY % 512;
          this.children[0].y = base + 512 * -1;
          this.children[1].y = base + 512 * -1;
          this.children[2].y = base + 512 * -1;
          this.children[3].y = base + 512 * 0;
          this.children[4].y = base + 512 * 0;
          this.children[5].y = base + 512 * 0;
          this.children[6].y = base + 512 * 1;
          this.children[7].y = base + 512 * 1;
          this.children[8].y = base + 512 * 1;
        },
      },
    },
  });

});
