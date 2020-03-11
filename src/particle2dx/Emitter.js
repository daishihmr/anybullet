phina.namespace(function() {

  phina.define("phina.particle2dx.Emitter", {
    superClass: "phina.app.Object2D",

    active: false,
    random: null,

    particles: null,

    emitCount: 0,
    emitPerMillisec: 0,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.Emitter.defaults);

      this.random = phina.util.Random();

      this._initProperties(options);
      this._initParticles(options);

      this.emitPerMillisec = this.maxParticles / (this.particleLifespan * 1000);
    },

    _initProperties: function(options) {
      var json = phina.asset.AssetManager.get("json", options.jsonName).data;

      this.duration = json.duration;

      // 0:Gravity 1:Radius
      this.emitterType = json.emitterType;

      // this.configName = json.configName;

      this.particleLifespan = json.particleLifespan;
      this.particleLifespanVariance = json.particleLifespanVariance;
      this.maxParticles = json.maxParticles; // なぜか全然足りないから２倍作っとく
      this.angle = json.angle;
      this.angleVariance = json.angleVariance;
      this.speed = json.speed;
      this.speedVariance = json.speedVariance;
      this.sourcePositionVariancex = json.sourcePositionVariancex;
      this.sourcePositionVariancey = json.sourcePositionVariancey;
      this.gravityx = json.gravityx;
      this.gravityy = json.gravityy;

      // 中心からの加速度
      this.radialAcceleration = json.radialAcceleration;
      this.radialAccelVariance = json.radialAccelVariance;

      // 接線加速度
      this.tangentialAcceleration = json.tangentialAcceleration;
      this.tangentialAccelVariance = json.tangentialAccelVariance;

      this.maxRadius = json.maxRadius;
      this.maxRadiusVariance = json.maxRadiusVariance;
      this.minRadius = json.minRadius;
      this.minRadiusVariance = json.minRadiusVariance;
      this.rotatePerSecond = json.rotatePerSecond;
      this.rotatePerSecondVariance = json.rotatePerSecondVariance;

      // 1:additive 771:normal
      this.blendFuncDestination = json.blendFuncDestination;
      // 770固定
      this.blendFuncSource = json.blendFuncSource;

      this.startParticleSize = json.startParticleSize;
      this.startParticleSizeVariance = json.startParticleSizeVariance;
      if (json.finishParticleSize == -1) {
        this.finishParticleSize = this.startParticleSize;
      } else {
        this.finishParticleSize = json.finishParticleSize;
      }
      this.finishParticleSizeVariance = json.finishParticleSizeVariance;
      this.rotationStart = json.rotationStart;
      this.rotationStartVariance = json.rotationStartVariance;
      this.rotationEnd = json.rotationEnd;
      this.rotationEndVariance = json.rotationEndVariance;

      this.startColorRed = json.startColorRed;
      this.startColorGreen = json.startColorGreen;
      this.startColorBlue = json.startColorBlue;
      this.startColorAlpha = json.startColorAlpha;
      this.startColorVarianceRed = json.startColorVarianceRed;
      this.startColorVarianceGreen = json.startColorVarianceGreen;
      this.startColorVarianceBlue = json.startColorVarianceBlue;
      this.startColorVarianceAlpha = json.startColorVarianceAlpha;
      this.finishColorRed = json.finishColorRed;
      this.finishColorGreen = json.finishColorGreen;
      this.finishColorBlue = json.finishColorBlue;
      this.finishColorAlpha = json.finishColorAlpha;
      this.finishColorVarianceRed = json.finishColorVarianceRed;
      this.finishColorVarianceGreen = json.finishColorVarianceGreen;
      this.finishColorVarianceBlue = json.finishColorVarianceBlue;
      this.finishColorVarianceAlpha = json.finishColorVarianceAlpha;

      // this.textureFileName = json.textureFileName;
      // this.textureImageData = json.textureImageData;
      // this.yCoordFlipped = json.yCoordFlipped;
    },

    _initParticles: function(options) {
      this.particles = Array.range(0, this.maxParticles)
        .map(function(index) {
          var p = this._createParticle(options.textureName, index);
          p.on("removed", function() {
            p.visible = false;
            this.particles.push(p);
          }.bind(this));
          return p;
        }.bind(this));
    },

    _createParticle: function(textureName, index) {
      throw "no impl";
    },

    _createParticleAccessory: function() {
      return phina.particle2dx.Particle();
    },

    start: function() {
      this.active = true;
      if (this.duration > 0) {
        this.tweener
          .clear()
          .wait(this.duration * 1000)
          .set({ active: false });
      }

      return this;
    },

    stop: function() {
      this.active = false;
      return this;
    },

    update: function(app) {
      if (!this.active) return;

      this.emitCount += this.emitPerMillisec * app.deltaTime;
      for (var i = 0; i < ~~this.emitCount; i++) {
        this.emit();
      }
      this.emitCount -= ~~(this.emitCount);
    },

    emit: function() {
      var p = this.particles.shift();
      if (!p) {
        // console.warn("たりない");
        return;
      }
      p.addChildTo(this.parent);

      var r = this.random;
      var particle = p.particle;

      particle.life = this.particleLifespan + r.randfloat(-this.particleLifespanVariance, this.particleLifespanVariance);
      particle.emitterType = this.emitterType;
      particle.emitterPosition.set(this.x, this.y);

      var sizeFrom = this.startParticleSize + r.randfloat(-this.startParticleSizeVariance, this.startParticleSizeVariance);
      var sizeTo = this.finishParticleSize + r.randfloat(-this.finishParticleSizeVariance, this.finishParticleSizeVariance);
      var rotationFrom = this.rotationStart + r.randfloat(-this.rotationStartVariance, this.rotationStartVariance);
      var rotationTo = this.rotationEnd + r.randfloat(-this.rotationEndVariance, this.rotationEndVariance);

      var rFrom = this.startColorRed + r.randfloat(-this.startColorVarianceRed, this.startColorVarianceRed);
      var rTo = this.finishColorRed + r.randfloat(-this.finishColorVarianceRed, this.finishColorVarianceRed);
      var gFrom = this.startColorGreen + r.randfloat(-this.startColorVarianceGreen, this.startColorVarianceGreen);
      var gTo = this.finishColorGreen + r.randfloat(-this.finishColorVarianceGreen, this.finishColorVarianceGreen);
      var bFrom = this.startColorBlue + r.randfloat(-this.startColorVarianceBlue, this.startColorVarianceBlue);
      var bTo = this.finishColorBlue + r.randfloat(-this.finishColorVarianceBlue, this.finishColorVarianceBlue);
      var aFrom = this.startColorAlpha + r.randfloat(-this.startColorVarianceAlpha, this.startColorVarianceAlpha);
      var aTo = this.finishColorAlpha + r.randfloat(-this.finishColorVarianceAlpha, this.finishColorVarianceAlpha);

      if (this.emitterType === 0) {

        particle.position.x = this.x + r.randfloat(-this.sourcePositionVariancex, this.sourcePositionVariancex);
        particle.position.y = this.y + r.randfloat(-this.sourcePositionVariancey, this.sourcePositionVariancey);

        var angle = (this.angle + r.randfloat(-this.angleVariance, this.angleVariance)).toRadian();
        var speed = this.speed + r.randfloat(-this.speedVariance, this.speedVariance);

        particle.velocity.set(Math.cos(angle) * speed, -Math.sin(angle) * speed);
        particle.gravity.set(this.gravityx, this.gravityy);
        particle.initRadialAccel(this.radialAcceleration + r.randfloat(-this.radialAccelVariance, this.radialAccelVariance));
        particle.tangentialAccel = this.tangentialAcceleration + r.randfloat(-this.tangentialAccelVariance, this.tangentialAccelVariance);

        particle.set({
          sizeFrom: sizeFrom,
          sizeTo: sizeTo,
          rotationFrom: rotationFrom,
          rotationTo: rotationTo,
          rFrom: rFrom,
          rTo: rTo,
          gFrom: gFrom,
          gTo: gTo,
          bFrom: bFrom,
          bTo: bTo,
          aFrom: aFrom,
          aTo: aTo,
        });

      } else if (this.emitterType === 1) {

        particle.posAngle = this.angle + r.randfloat(-this.angleVariance, this.angleVariance);

        var radiusFrom = this.maxRadius + r.randfloat(-this.maxRadiusVariance, this.maxRadiusVariance);
        var radiusTo = this.minRadius + r.randfloat(-this.minRadiusVariance, this.minRadiusVariance);
        particle.rotPerSec = (this.rotatePerSecond + r.randfloat(-this.rotatePerSecondVariance, this.rotatePerSecondVariance)).toRadian();

        particle.set({
          sizeFrom: sizeFrom,
          sizeTo: sizeTo,
          rotationFrom: rotationFrom,
          rotationTo: rotationTo,
          rFrom: rFrom,
          rTo: rTo,
          gFrom: gFrom,
          gTo: gTo,
          bFrom: bFrom,
          bTo: bTo,
          aFrom: aFrom,
          aTo: aTo,
          radiusFrom: radiusFrom,
          radiusTo: radiusTo,
        });
      }

      particle.update({ deltaTime: 0 });
    },

    _static: {
      defaults: {
        jsonName: null,
        textureName: null,
      },
    },

  });

});