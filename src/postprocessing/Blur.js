phina.namespace(() => {

  phina.define("Blur", {
    superClass: "PostProcessingPass",

    init: function (gl, w, h) {
      this.superInit();
      this.framebuffer = this.createFramebuffer(gl, w, h);
      this.drawable = this.createDrawable(gl, "blur.fs", ["srcTexture"]);
      this.direction = [0, 0];
    },

    setDirection: function (h, v) {
      this.direction[0] = h;
      this.direction[1] = v;
    },

    render: function (gl, previousTexture) {
      if (!this.isEnd) {
        this.framebuffer.bind(gl);
      } else {
        phigl.Framebuffer.unbind(gl);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.drawable.uniforms["srcTexture"].setValue(0).setTexture(previousTexture);
      this.drawable.uniforms["direction"].setValue(this.direction);
      this.drawable.draw();
      phigl.Framebuffer.unbind(gl);

      this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
    },

  });

});
