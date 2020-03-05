phina.namespace(() => {

  phina.define("GLAppRenderer", {

    gl: null,
    context: null,

    init: function (gl) {
      gl.clearColor(0.1, 0.1, 0.2, 1.0);
      gl.clearDepth(1.0);

      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.depthFunc(gl.LEQUAL);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      this.gl = gl;
      this.context = GLContext2D();

      this.spriteArrays = {};
    },

    addSpriteArray: function (name, atlas, max = 1000) {
      const array = GLSpriteArray(this.gl, atlas, max);
      this.spriteArrays[name] = array;
      return array;
    },

    getSpriteArray: function (name) {
      return this.spriteArrays[name];
    },

    render: function (scene) {
      const gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.renderChildren(scene);
      for (let name in this.spriteArrays) {
        const array = this.spriteArrays[name];
        array.draw(gl);
      }
    },

    renderChildren: function (obj) {
      if (obj.children.length > 0) {
        let tempChildren = obj.children.slice();
        for (let i = 0, len = tempChildren.length; i < len; ++i) {
          this.renderObject(tempChildren[i]);
        }
      }
    },

    renderObject: function (obj) {
      if (obj.visible === false) return;

      const context = this.context;

      obj._calcWorldMatrix && obj._calcWorldMatrix();
      obj._calcWorldAlpha && obj._calcWorldAlpha();

      context.globalAlpha = obj._worldAlpha;
      context.globalCompositeOperation = obj.blendMode;

      obj.draw && obj.draw(this.gl);

      let tempChildren = obj.children.slice();
      for (let i = 0, len = tempChildren.length; i < len; ++i) {
        this.renderObject(tempChildren[i]);
      }
    },
  });

  phina.define("GLContext2D", {
    init: function () {
      this.globalAlpha = 1.0;
      this.globalCompositeOperation = "source-over";
    },
  });

});
