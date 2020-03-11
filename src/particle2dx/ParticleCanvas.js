phina.namespace(function() {

  phina.define("phina.particle2dx.ParticleCanvas", {
    superClass: "phina.display.Sprite",

    particle: null,

    init: function(image) {
      this.superInit(image);
      this.particle = phina.particle2dx.Particle().attachTo(this);
    },

    draw: function(canvas) {
      if (this.image.setColor) this.image.setColor(this.r, this.g, this.b);
      this.superMethod("draw", canvas);
    },

  });

});