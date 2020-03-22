phina.namespace(() => {

  phina.define("GLAppRenderer", {
    superClass: "phina.util.EventDispatcher",

    gl: null,
    lighting: null,

    init: function (gl, w, h) {
      this.superInit();

      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1.0);

      this.gl = gl;
      this.spriteArrays = {};
      this.lighting = Lighting();
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

      this.flare("prerender", { gl });

      gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      for (let name in this.spriteArrays) {
        const array = this.spriteArrays[name];
        array.draw(gl, this.lighting);
      }
      this.renderChildren(scene);

      this.flare("postrender", { gl, scene });
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

      obj._calcWorldMatrix && obj._calcWorldMatrix();
      obj._calcWorldAlpha && obj._calcWorldAlpha();

      obj.draw && obj.draw(this.gl, this.lighting);

      let tempChildren = obj.children.slice();
      for (let i = 0, len = tempChildren.length; i < len; ++i) {
        this.renderObject(tempChildren[i]);
      }
    },

    addNext: function (pass) {
      pass.setRenderer(this);
      return pass;
    },

  });

});
