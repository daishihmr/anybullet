phina.namespace(() => {

  phina.define("PointLight", {
    superClass: "DisplayElement",

    index: 0,
    z: 0,

    r: 0,
    g: 0,
    b: 0,
    power: 0,

    init: function (options) {
      options = ({}).$extend(PointLight.defaults, options);
      this.superInit(options);
      this.index = options.index;
      this.z = options.z;
    },

    setZ: function (value) {
      this.z = value;
      return this;
    },

    setPower: function (v) {
      this.power = v;
      return this;
    },

    setColor: function (r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
      return this;
    },

    set: function (drawable) {
      const uni = drawable.uniforms;
      const i = this.index;
      if (this.parent && this.visible) {
        uni[`lightColor[${i}]`].setValue([this.r / 255, this.g / 255, this.b / 255, 1]);
        uni[`lightPower[${i}]`].setValue(this.power);
        uni[`lightPosition[${i}]`].setValue([this.x, this.y, this.z]);
      } else {
        uni[`lightColor[${i}]`].setValue([0, 0, 0, 1]);
        uni[`lightPower[${i}]`].setValue(0);
        uni[`lightPosition[${i}]`].setValue([0, 0, 0]);
      }
    },

    _static: {
      defaults: {
        z: 30,
        power: 0,
      },
    },

  });

});
