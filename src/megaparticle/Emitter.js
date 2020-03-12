phina.namespace(() => {

  phina.define("megaparticle.Emitter", {
    superClass: "phina.app.Object2D",

    init: function (json, particleSystem) {
      this.superInit();
      this.json = json;
      this.particleSystem = particleSystem;

      this.emitCount = 0;
      this.emitPerMillisec = json.maxParticles / ((json.particleLifespan + json.particleLifespanVariance) * 1000);
    },

    update: function (app) {
      const json = this.json;
      const particleSystem = this.particleSystem;

      if (app.deltaTime < 1000) {
        this.emitCount += this.emitPerMillisec * app.deltaTime;
      } else {
        this.emitCount = 0;
      }

      particleSystem.emit({
        indices: particleSystem.getIndices(this.emitCount, json.particleLifespan + json.particleLifespanVariance),
        emitterPositionX: this.x,
        emitterPositionY: this.y,
      }.$extend(json));

      this.emitCount -= ~~(this.emitCount);
    },

  });

});
