phina.namespace(() => {

  phina.define("Emission", {
    superClass: "PostProcessingPass",

    next2: null,

    init: function (gl, w, h) {
      this.superInit();

      this.dark = Lighting();

      this.framebuffer = this.createFramebuffer(gl, w, h);
      this.drawable = this.createDrawable(gl);
    },

    setRenderer: function (renderer) {
      renderer.on("postrender", ({ gl, scene }) => {
        this.render(gl, scene, renderer);
      });
    },

    render: function (gl, scene, renderer) {
      const bkup = renderer.lighting;
      renderer.lighting = this.dark;

      if (!this.isEnd) {
        this.framebuffer.bind(gl);
      } else {
        phigl.Framebuffer.unbind(gl);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (let name in renderer.spriteArrays) {
        const array = renderer.spriteArrays[name];
        array.draw(gl, renderer.lighting);
      }
      renderer.renderChildren(scene);
      renderer.lighting = bkup;

      phigl.Framebuffer.unbind(gl);

      this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
    },

  });

});
