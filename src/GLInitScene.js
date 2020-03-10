phina.namespace(() => {

  phina.define("GLInitScene", {
    superClass: "Scene",

    init: function (options) {
      this.superInit();

      const renderer = options.app.renderer;
      const spec = options.spriteArray;
      for (let name in spec) {
        renderer.addSpriteArray(name, spec[name].atlas, spec[name].max);
      }
      this.one("enterframe", () => this.start());
    },

    start: function () {
      this.exit();
    },
  });

});
