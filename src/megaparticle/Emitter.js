phina.namespace(() => {

  phina.define("megaparticle.Emitter", {
    superClass: "phina.app.Object2D",

    _static: {
      lastId: -1,
    },

    init: function (json, particleSystem) {
      this.superInit();
      this.json = json;
      this.particleSystem = particleSystem;

      this.id = megaparticle.Emitter.lastId + 1;
      this.indices = particleSystem.getIndices(json.maxParticles);

      megaparticle.Emitter.lastId += 1;
    },

    start: function (x, y) {
      this.particleSystem.start(this.id, x, y, this.indices, this.json);
    },

    stop: function () {
      this.particleSystem.reserveStop(this.indices);
    },

  });

});
