phina.namespace(() => {

  phina.define("Add", {
    superClass: "PostProcessingPass",

    weight: null,

    init: function (gl, w, h) {
      this.superInit();
      this.framebuffer = this.createFramebuffer(gl, w, h);
      this.drawable = this.createDrawable(gl, "add.fs", ["srcTextureA", "srcTextureB"]);
      this.weight = [1, 1];
    },

    setWeight: function (a, b) {
      this.weight[0] = a;
      this.weight[1] = b;
    },

    render: function (gl, previousTextureA, previousTextureB) {
      if (!this.isEnd) {
        this.framebuffer.bind(gl);
      } else {
        phigl.Framebuffer.unbind(gl);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // gl.enable(gl.BLEND);
      // gl.blendFunc(gl.ONE, gl.ONE);
      this.drawable.uniforms["srcTextureA"].setValue(0).setTexture(previousTextureA);
      this.drawable.uniforms["srcTextureB"].setValue(1).setTexture(previousTextureB);
      this.drawable.uniforms["weight"].setValue(this.weight);
      this.drawable.draw();
      phigl.Framebuffer.unbind(gl);

      this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
    },

  });

});
