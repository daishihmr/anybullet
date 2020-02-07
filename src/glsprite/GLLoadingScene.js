phina.namespace(() => {

  phina.define("GLLoadingScene", {
    superClass: "GLScene",

    init: function (params) {
      this.superInit(params);

      const loader = phina.asset.AssetLoader();
      loader.on("load", () => {
        this.app.popScene();
      });
      loader.load(params.assets);
    },
  });

});
