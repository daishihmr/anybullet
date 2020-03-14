phina.namespace(() => {

  phina.define("megaparticle.Emitter", {
    superClass: "phina.app.Object2D",

    init: function (json, particleSystem) {
      this.superInit();
      this.json = json;
      this.particleSystem = particleSystem;

      this.indices = particleSystem.getIndices(json.maxParticles);
    },

    start: function (x, y) {
      this.particleSystem.start(x, y, this.indices, this.json);
    },

    stop: function () {
      this.particleSystem.reserveStop(this.indices);
    },

  });

});
