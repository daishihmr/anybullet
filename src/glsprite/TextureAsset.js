phina.namespace(() => {

  phina.define("TextureAsset", {
    _static: {
      get: function (gl, name) {
        const AssetManager = phina.asset.AssetManager;

        if (typeof(name) !== "string") {
          if (name._id) {
            name = name._id;
          } else {
            name._id = gen();
            AssetManager.set("image", name._id, name);
          }

          name = name._id;
        }

        if (AssetManager.get("texture", name) == null) {
          const img = AssetManager.get("image", name);
          if (img == null) {
            console.log("そんな画像ないです " + name);
            return null;
          }
          AssetManager.set("texture", name, phigl.Texture(gl, img));
        }

        return AssetManager.get("texture", name);
      },
    },
  });

  const gen = () =>  Date.now() + "-" + phina.util.Random.randint(0, 1000) + "-" + phina.util.Random.randint(0, 1000) + "-" + phina.util.Random.randint(0, 1000);

});
