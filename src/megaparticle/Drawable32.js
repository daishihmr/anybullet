phina.namespace(() => {

  phina.define("phigl.Drawable32", {
    superClass: "phigl.Drawable",

    init: function(gl) {
      this.superInit(gl);
    },

    setIndexValues: function(value) {
      if (!this.indices) this.indices = phigl.Ibo32(this.gl);
      this.indices.set(value);
      return this;
    },

    draw: function() {
      var gl = this.gl;
      var ext = this.extVao;

      this.program.use();

      if (this.vao) {
        ext.bindVertexArrayOES(this.vao);
      } else {
        if (this.indices) this.indices.bind();
        if (this.vbo) this.vbo.bind();
        var stride = this.stride;
        this.attributes.forEach(function(v, i) {
          v.enable();
          v.specify(stride);
        });
      }

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.gl.drawElements(this.drawMode, this.indices.length, gl.UNSIGNED_INT, 0);
      this.flare("postdraw");

      if (this.vao) {
        ext.bindVertexArrayOES(null);
      } else {
        phigl.Ibo.unbind(gl);
        phigl.Vbo.unbind(gl);
      }

      this.attributes.forEach(function(v, i) {
        v.disable();
      });
      this.uniforms.forIn(function(k, v) { v.reassign() });
    },

  });

});
