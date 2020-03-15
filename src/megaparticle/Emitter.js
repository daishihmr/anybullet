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

      this.z = 0;

      megaparticle.Emitter.lastId += 1;
    },

    setZ: function(v) {
      this.z = v;
      return this;
    },

    start: function () {
      this.particleSystem.start(this.id, this.x, this.y, this.z, this.indices, this.json);
      return this;
    },

    stop: function () {
      this.particleSystem.reserveStop(this.indices);
      return this;
    },

  });

});
