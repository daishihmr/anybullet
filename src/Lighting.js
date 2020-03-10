phina.namespace(() => {

  const POINT_LIGHT_COUNT = 10;

  phina.define("Lighting", {

    ambient: null,
    pointLights: null,

    init: function () {
      this.ambient = [0, 0, 0, 1];
      this.pointLights = Array.range(0, POINT_LIGHT_COUNT).map(index => {
        const pl = PointLight({ index });
        return pl;
      });
    },

  });

});
