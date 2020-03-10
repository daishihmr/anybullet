phina.namespace(() => {

  phina.define("StartPass", {
    superClass: "PostProcessingPass",

    init: function (gl, w, h) {
      this.superInit();
      this.framebuffer = this.createFramebuffer(gl, w, h);
    },

    setRenderer: function (renderer) {
      renderer.on("prerender", ({ gl }) => {
        this.framebuffer.bind(gl);
      });
      renderer.on("postrender", ({ gl, scene }) => {
        phigl.Framebuffer.unbind(gl);
        this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
      });
    },

  });

});
