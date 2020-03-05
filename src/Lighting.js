phina.namespace(() => {

  phina.define("Lighting", {

    ambient: null,
    pointLights: null,

    init: function () {
      this.ambient = [0, 0, 0, 1];
      this.pointLights = Array.range(0, 8).map(index => {
        const pl = PointLight({ index });
        return pl;
      });
    },

  });

});
