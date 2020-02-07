phina.namespace(() => {

  phina.define("GLInitScene", {
    superClass: "Scene",

    init: function () {
      this.superInit();
      this.one("enterframe", () => this.start());
    },

    start: function() {
      this.app.renderer.addSpriteArray("common", "common", 30000);
      this.exit();
    },
  });

});
