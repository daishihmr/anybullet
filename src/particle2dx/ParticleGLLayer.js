phina.namespace(function() {

  phina.define("phina.particle2dx.ParticleGLLayer", {
    superClass: "phina.display.Layer",

    emitters: null,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.ParticleGLLayer.defaults);

      this.emitters = [];

      this.domElement = options.domElement || document.createElement("canvas");
      this.domElement.width = this.width * options.quality;
      this.domElement.height = this.height * options.quality;

      var gl = this.domElement.getContext("webgl") || this.domElement.getContext("experimental-webgl");

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

      var projectionMatrix = mat4.create();
      var viewMatrix = mat4.create();
      var modelMatrix = mat4.create();
      var vpMatrix = mat4.create();
      mat4.ortho(projectionMatrix, 0, this.width, this.height, 0, 0.9, 1.1);
      mat4.lookAt(viewMatrix, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
      mat4.mul(vpMatrix, projectionMatrix, viewMatrix);

      this.gl = gl;
      this.ext = phigl.Extensions.getInstancedArrays(gl);
      this.vpMatrix = vpMatrix;
    },

    createEmitter: function(options) {
      var emitter = phina.particle2dx.EmitterGL(options);
      this.emitters.push(emitter);
      emitter.addChildTo(this);
      emitter.setup(this);
      emitter.on("removed", function() {
        this.emitters.erase(emitter);
      }.bind(this));
      return emitter;
    },

    draw: function(canvas) {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      this._drawParticles();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image,
        0, 0, image.width, image.height, //
        -this.width * this.originX, -this.height * this.originY, this.width, this.height //
      );
    },

    _drawParticles: function() {
      for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].render(this);
      }
    },

    _static: {
      defaults: {},
    },
  });

});