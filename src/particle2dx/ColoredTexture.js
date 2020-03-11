phina.namespace(function() {

  phina.define("phina.particle2dx.ColoredTexture", {
    superClass: "phina.graphics.Canvas",

    orig: null,

    r: -1,
    g: -1,
    b: -1,

    _textureName: null,
    _domElementBackup: null,

    init: function(options) {
      this.superInit();
      this.orig = phina.asset.AssetManager.get("image", options.textureName);
      this.setSize(this.orig.domElement.width, this.orig.domElement.height);

      this._textureName = options.textureName;

      this._canvasForCache = Array.range(0, 1000).map(function() {
        return phina.graphics.Canvas().setSize(this.width, this.height);
      }.bind(this));

      this.setColor(1.0, 1.0, 1.0);
    },

    setColor: function(r, g, b) {
      const nr = (~~(r * 256)) * 1;
      const ng = (~~(g * 256)) * 1;
      const nb = (~~(b * 256)) * 1;

      if (this.r === nr && this.g === ng && this.b === nb) return;

      this.r = nr;
      this.g = ng;
      this.b = nb;

      const key = "{_textureName},{r},{g},{b}".format(this);
      const cache = phina.particle2dx.ColoredTexture._cache;
      if (cache[key]) {
        if (!this._domElementBackup) this._domElementBackup = this.domElement;
        this.domElement = cache[key].domElement;
      } else {
        if (this._domElementBackup) this.domElement = this._domElementBackup;

        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.orig.domElement, 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "rgb({r},{g},{b})".format(this);
        ctx.fillRect(0, 0, this.width, this.height);

        const clone = this._canvasForCache.length ? this._canvasForCache.shift() : phina.graphics.Canvas().setSize(this.width, this.height);
        clone.context.drawImage(this.domElement, 0, 0);
        cache[key] = clone;
      }
    },

    _static: {
      _cache: {},
    },

  });

});