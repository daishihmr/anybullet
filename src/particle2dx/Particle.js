phina.namespace(function() {

  phina.define("phina.particle2dx.Particle", {
    superClass: "phina.accessory.Accessory",

    emitterType: 0,

    r: 1.0,
    g: 1.0,
    b: 1.0,
    a: 1.0,

    emitterPosition: null,
    life: 0,

    position: null,
    velocity: null,
    gravity: null,
    radialAccel: null,
    tangentialAccel: 0,
    _tangentialAccel: null,

    posAngle: 0,
    rotPerSec: 0,

    init: function() {
      this.superInit();

      this.position = phina.geom.Vector2();
      this.velocity = phina.geom.Vector2();
      this.gravity = phina.geom.Vector2();
      this.radialAccel = phina.geom.Vector2();
      this.emitterPosition = phina.geom.Vector2();
      this._tangentialAccel = phina.geom.Vector2();
    },

    initRadialAccel: function(radialAccelLength) {
      this.radialAccel
        .set(this.position.x - this.emitterPosition.x, this.position.y - this.emitterPosition.y)
        .normalize()
        .mul(radialAccelLength);
    },

    set: function(data) {
      var duration = this.life * 1000;
      var p = this.target;
      p.visible = true;
      if (this.emitterType === 0) {
        p.$extend({
          scale: data.sizeFrom,
          rotation: data.rotationFrom,
          r: data.rFrom,
          g: data.gFrom,
          b: data.bFrom,
          a: data.aFrom,
        });
        p.tweener
          .clear()
          .to({
            scale: data.sizeTo,
            rotation: data.rotationTo,
            r: data.rTo,
            g: data.gTo,
            b: data.bTo,
            a: data.aTo,
          }, duration)
          .call(function() {
            p.remove();
          });
      } else if (this.emitterType === 1) {
        p.$extend({
          scale: data.sizeFrom,
          rotation: data.rotationFrom,
          r: data.rFrom,
          g: data.gFrom,
          b: data.bFrom,
          a: data.aFrom,
          posRadius: data.radiusFrom,
        });
        p.tweener
          .clear()
          .to({
            scale: data.sizeTo,
            rotation: data.rotationTo,
            r: data.rTo,
            g: data.gTo,
            b: data.bTo,
            a: data.aTo,
            posRadius: data.radiusTo,
          }, duration)
          .call(function() {
            p.remove();
          });
      }
    },

    update: function(app) {
      var deltaSec = app.deltaTime * 0.001;

      if (this.emitterType === 0) {
        add(this.velocity, this.gravity, deltaSec);
        add(this.velocity, this.radialAccel, deltaSec);

        if (this.tangentialAccel) {
          this._tangentialAccel
            .set(this.position.x - this.emitterPosition.x, this.position.y - this.emitterPosition.y);

          this._tangentialAccel
            .set(-this._tangentialAccel.y, this._tangentialAccel.x) // 90度回す
            .normalize()
            .mul(this.tangentialAccel);
          add(this.velocity, this._tangentialAccel, deltaSec);
        }

        add(this.position, this.velocity, deltaSec);
      } else if (this.emitterType === 1) {
        this.posAngle -= this.rotPerSec * deltaSec;
        this.position.set(
          this.emitterPosition.x + Math.cos(this.posAngle) * this.target.posRadius,
          this.emitterPosition.y - Math.sin(this.posAngle) * this.target.posRadius
        );
      }

      this.target.x = this.position.x;
      this.target.y = this.position.y;
    },

  });

  var add = function(vec1, vec2, deltaSec) {
    vec1.x += vec2.x * deltaSec;
    vec1.y -= vec2.y * deltaSec;
  };

});