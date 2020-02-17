phina.namespace(() => {

  const SPEED = 18;

  phina.define("ShotBullet", {
    superClass: "GLSprite",

    init: function (params) {
      this.superInit({
        spriteArray: params.spriteArray,
        image: "black.png",
      });

      this.power = 1;
      this.r = 1;

      this.beforePosition = Vector2(0, 0);
      this.velocity = Vector2(0, 0);
    },

    setAngle: function (rad) {
      this.velocity.fromAngle(rad, SPEED);
      this.rotation = rad.toDegree() + 90;
      return this;
    },

    update: function () {
      this.beforePosition.set(this.x, this.y);
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      if (this.x < 0 || CANVAS_WIDTH <= this.x || this.y < 0 || CANVAS_HEIGHT <= this.y) {
        this.remove();
      }
    },

    hit: function () {
      this.remove();
    },

    _accessor: {
      a: {
        get: function () {
          return this.beforePosition;
        },
      },
      b: {
        get: function () {
          return this.position;
        },
      },
      left: {
        get: function () {
          return Math.min(this.a.x, this.b.x);
        },
        set: function () { },
      },
      right: {
        get: function () {
          return Math.max(this.a.x, this.b.x);
        },
        set: function () { },
      },
      top: {
        get: function () {
          return Math.min(this.a.y, this.b.y);
        },
        set: function () { },
      },
      bottom: {
        get: function () {
          return Math.max(this.a.y, this.b.y);
        },
        set: function () { },
      },
    },
  });
});
