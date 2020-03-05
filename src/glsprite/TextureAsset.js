phina.namespace(() => {

  phina.define("TextureAsset", {
    _static: {
      get: function (gl, name) {
        const AssetManager = phina.asset.AssetManager;

        if (AssetManager.get("texture", name) == null) {
          const img = AssetManager.get("image", name);
          if (img == null) {
            console.log("ないよ " + name);
            return;
          }
          AssetManager.set("texture", name, phigl.Texture(gl, img));
        }

        return AssetManager.get("texture", name);
      },
    },
  });

});
