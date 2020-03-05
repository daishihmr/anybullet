phina.namespace(() => {

  phina.define("TiledAsset", {
    superClass: "phina.asset.Asset",

    init: function () {
      this.superInit();
      this.tilesets = null;
    },

    _load: function (resolve) {
      const src = this.src.startsWith("/") ? this.src : "./" + this.src;
      const basePath = src.substring(0, src.lastIndexOf("/") + 1);
      fetch(src)
        .then(res => res.json())
        .then(json => {
          this.json = json;
          Promise.all(
            json.tilesets.map((ts, id) => Tileset(id, ts).load(basePath + ts.source))
          ).then(tilesets => {
            this.tilesets = tilesets;
            resolve(this);
          });
        });
    },
  });

  phina.define("Tileset", {
    init: function (id, tileset) {
      this.id = id;
      this.image = null;
      this.normalImage = null;
      this.firstgid = tileset.firstgid;
      this.source = tileset.source;

      this.json = null;
      this.tilewidth = 0;
      this.tileheight = 0;
      this.imagewidth = 0;
      this.imageheight = 0;
      this.cols = 0;
      this.rows = 0;
    },

    load: function (path) {
      return new Promise(resolve => {
        fetch(path).then(res => res.json()).then(json => {
          this.json = json;
          this.setup();
          if (json.image) {
            const _path = path.startsWith("/") ? path : "./" + path;
            const basePath = _path.substring(0, _path.lastIndexOf("/") + 1);
            Flow.resolve()
              .then(() => {
                this.image = phina.asset.Texture();
                return this.image.load(basePath + json.image);
              })
              .then(() => {
                const filename = json.image.replace(".png", "_n.png");
                this.normalImage = phina.asset.Texture();
                return this.normalImage.load(basePath + filename);
              })
              .then(() => resolve(this));
          } else {
            resolve(this);
          }
        });
      });
    },

    setup: function () {
      this.tilewidth = this.json.tilewidth;
      this.tileheight = this.json.tileheight;
      this.imagewidth = this.json.imagewidth;
      this.imageheight = this.json.imageheight;
      this.cols = this.imagewidth / this.json.tilewidth;
      this.rows = this.imageheight / this.json.tileheight;
    },

    calcUv: function (cell) {
      const index = cell - this.firstgid;
      const u0 = (index % this.cols) * this.tilewidth / this.imagewidth;
      const u1 = u0 + this.tilewidth / this.imagewidth;
      const v0 = (Math.floor(index / this.cols) * this.tileheight) / this.imageheight;
      const v1 = v0 + this.tileheight / this.imageheight;

      return [
        u0, v1,
        u1, v1,
        u0, v0,
        u1, v0,
      ];
    },
  });

  phina.asset.AssetLoader.register('tiled', function (key, src) {
    var asset = TiledAsset();
    return asset.load(src);
  });

});
