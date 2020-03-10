phina.namespace(() => {

  const POINT_LIGHT_COUNT = 10;

  phina.define("Lighting", {

    r: 0,
    g: 0,
    b: 0,
    pointLights: null,

    init: function () {
      this.pointLights = Array.range(0, POINT_LIGHT_COUNT).map(index => {
        const pl = PointLight({ index });
        return pl;
      });
    },

    setColor: function (r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
      return this;
    },

    set: function (drawable) {
      drawable.uniforms["ambientColor"].setValue([this.r / 255, this.g / 255, this.b / 255, 1]);

      const ps = this.pointLights;
      for (let i = 0, len = ps.length; i < len; i++) {
        ps[i].set(drawable);
      }
    },

  });

});
