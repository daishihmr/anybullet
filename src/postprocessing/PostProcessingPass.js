phina.namespace(() => {

  phina.define("PostProcessingPass", {
    superClass: "phina.util.EventDispatcher",

    enabled: false,
    isEnd: false,

    framebuffer: null,

    init: function () {
      this.superInit();
    },

    createFramebuffer: function (gl, w, h) {
      return phigl.Framebuffer(gl, w, h);
    },
    createDrawable: function (gl, fragmentShader = "passthrough.fs", uniforms = ["srcTexture"]) {
      const program = phigl.Program(gl)
        .attach("postprocessing.vs")
        .attach(fragmentShader)
        .link();
      return phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            -1, 1,
            1, 1,
            -1, -1,
            1, -1,
          ]
        }, {
          unitSize: 2,
          data: [
            0, 1,
            1, 1,
            0, 0,
            1, 0,
          ],
        },])
        .createVao()
        .declareUniforms(...uniforms);
    },

    render: function (gl, previousTexture) {
      this.flare("postrender", { gl, previousTexture });
    },

    setEnabled: function (v) {
      this.enabled = v;
      return this;
    },

    setNext: function (next) {
      this.on("postrender", ({ gl, previousTexture }) => {
        next.render(gl, previousTexture);
      });
      return next;
    },

  });

});
