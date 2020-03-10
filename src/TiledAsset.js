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
      this.emissionImage = null;
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
              .then(() => {
                const filename = json.image.replace(".png", "_e.png");
                this.emissionImage = phina.asset.Texture();
                return this.emissionImage.load(basePath + filename);
              })
              .then(() => {
                if (json.transparentcolor) {
                  this.procTransparent(json.transparentcolor);
                }
              })
              .then(() => resolve(this));
          } else {
            resolve(this);
          }
        });
      });
    },

    procTransparent: function (transparentcolor) {
      const r = Number("0x" + transparentcolor.substring(1, 3));
      const g = Number("0x" + transparentcolor.substring(3, 5));
      const b = Number("0x" + transparentcolor.substring(5, 7));

      const img = this.image.domElement;
      const canvas = phina.graphics.Canvas().setSize(img.width, img.height);
      canvas.context.drawImage(img, 0, 0);
      const imgData = canvas.context.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 0] == r && data[i + 1] == g && data[i + 2] == b) {
          data[i + 0] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
      canvas.context.putImageData(imgData, 0, 0);

      this.image = canvas;
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
      const w = this.tilewidth / this.imagewidth;
      const h = this.tileheight / this.imageheight;

      const index = cell - this.firstgid;
      const u0 = (index % this.cols) * w;
      const u1 = u0 + w;
      const v0 = Math.floor(index / this.cols) * h;
      const v1 = v0 + h;

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
