phina.namespace(function() {

  phina.define("phina.atlas.AtlasAnimator", {
    superClass: "phina.accessory.Accessory",

    updateType: "time", // or "frame"

    time: 0,
    currentFrame: 0,
    fps: 30,
    loop: false,

    fpu: 1, // frame per update.

    _playing: false,
    _bf: 0,

    init: function(target) {
      this.superInit(target);
    },

    update: function(app) {
      if (this._playing) {
        var frameTime;
        if (this.updateType === "time") {
          frameTime = 1000 / this.fps;
          this.time += app.deltaTime;
        } else if (this.updateType === "frame") {
          frameTime = 1;
          this.time += this.fpu;
        }
        this._bf = (this.time / frameTime).floor();

        if (this.currentFrame === this._bf) {
          return;
        }
        this.currentFrame = this._bf;
        this.target.setFrame(~~this.currentFrame);
        var frameLength = this.target.atlas.data.frames.length;
        if (this.currentFrame >= frameLength - 1) {
          this.flare("finish");
          if (this.loop) {
            this.time = (this.time - frameLength * frameTime) % (frameLength * frameTime);
          } else {
            this.stop();
          }
        }
      }
    },

    setUpdateType: function(v) {
      this.updateType = v;
      return this;
    },

    play: function() {
      this.time = 0;
      this._playing = true;
      return this;
    },

    pause: function() {
      this._playing = false;
      return this;
    },

    resume: function() {
      this._playing = true;
      return this;
    },

    stop: function() {
      this.time = 0;
      this._playing = false;
      return this;
    },

    _accessor: {
      isPlaying: {
        get: function() { return this._playing; },
      },
    },
  });

});

phina.namespace(function() {

  phina.define("phina.asset.Atlas", {
    superClass: "phina.asset.Asset",

    data: null,
    images: null,

    init: function() {
      this.superInit();
      this.images = {};
      this.frameCache = {};
    },

    load: function(key, src) {
      this.key = key;
      if (typeof(src) === "string") {
        this.src = [src];
      } else {
        this.src = src;
      }
      return phina.util.Flow(this._load.bind(this));
    },

    _load: function(resolve) {
      var self = this;

      var flows = self.src.map(function(src) {
        var basePath = null;
        if (src.indexOf('/') < 0) {
          basePath = './';
        } else {
          basePath = src.substring(0, src.lastIndexOf('/') + 1);
        }

        return self._loadJson(src)
          .then(function(data) {
            return self._loadImage(data, basePath);
          });
      });

      phina.util.Flow.all(flows)
        .then(function(dataList) {
          return self._mergeData(dataList);
        })
        .then(function() {
          resolve(self);
        });
    },

    _loadJson: function(src) {
      var self = this;
      return phina.util.Flow(function(resolve) {
        var xml = new XMLHttpRequest();
        xml.open('GET', src);
        xml.onreadystatechange = function() {
          if (xml.readyState === 4) {
            if ([200, 201, 0].indexOf(xml.status) !== -1) {
              var data = JSON.parse(xml.responseText);
              resolve(data);
            }
          }
        };
        xml.send(null);
      });
    },

    _loadImage: function(data, basePath) {
      var self = this;
      return phina.util.Flow(function(resolve) {
        var image = phina.asset.Texture();
        self.images[data.meta.image] = image;
        image.load(basePath + data.meta.image).then(function() {
          resolve(data);
        });
      });
    },

    _mergeData: function(dataList) {
      var self = this;
      this.data = {
        frames: [],
        meta: {
          app: dataList[0].meta.appapp,
          version: dataList[0].meta.version,
          format: dataList[0].meta.format,
          scale: dataList[0].meta.scale,
          smartupdate: dataList[0].meta.smartupdate,
        },
      };
      dataList.forEach(function(data) {
        var frames = data.frames;
        if (frames instanceof Array == false) {
          frames = Object.keys(frames).map(function(key) {
            var frame = frames[key];
            frame.filename = key;
            return frame;
          });
        }

        frames.forEach(function(frame) {
          frame.image = data.meta.image;
          frame.size = data.meta.size;
        });

        self.data.frames = self.data.frames.concat(frames);
      });

      this.data.frames.sort(function(lhs, rhs) {
        return (lhs.filename <= rhs.filename) ? -1 : 1;
      });
    },

    getFrameByName: function(name) {
      var frame = this.frameCache[name];
      if (!frame) {
        frame = this.frameCache[name] = this.data.frames.find(function(f) {
          return f.filename === name;
        });
      }
      return frame;
    },

    unpackAll: function() {
      var self = this;
      var data = self.data;
      var frames = data.frames;
      if (frames instanceof Array == false) {
        frames = Object.keys(frames).map(function(key) {
          var frame = frames[key];
          frame.filename = key;
          return frame;
        });
      }

      return frames.reduce(function(ret, frame) {
        var canvas = phina.graphics.Canvas();

        var f = frame.frame;
        var s = frame.spriteSourceSize;
        var src = frame.sourceSize;
        var p = frame.pivot;

        var image = self.images[frame.image].domElement;

        canvas.setSize(src.w, src.h);
        if (!frame.rotated) {
          canvas.context.drawImage(image,
            f.x, f.y, f.w, f.h,
            s.x, s.y, s.w, s.h
          );
        } else {
          canvas.context.save();
          canvas.context.translate(src.w * p.x, src.h * p.y);
          canvas.context.rotate(Math.PI * -0.5);
          canvas.context.translate(-src.h * p.y, -src.w * p.x);
          canvas.context.drawImage(image,
            f.x, f.y, f.h, f.w,
            s.y, s.x, s.h, s.w
          );
          canvas.context.restore();
        }

        ret[frame.filename] = canvas;
        return ret;
      }, {});
    },

    unpack: function(frame) {
      var data = this.data;
      var frames = data.frames;
      if (frames instanceof Array == false) {
        frames = Object.keys(frames).map(function(key) {
          var frame = frames[key];
          frame.filename = key;
          return frame;
        });
      }

      var canvas = phina.graphics.Canvas();

      var f = frame.frame;
      var s = frame.spriteSourceSize;
      var src = frame.sourceSize;
      var p = frame.pivot;

      var image = this.images[frame.image].domElement;

      canvas.setSize(src.w, src.h);
      if (!frame.rotated) {
        canvas.context.drawImage(image,
          f.x, f.y, f.w, f.h,
          s.x, s.y, s.w, s.h
        );
      } else {
        canvas.context.save();
        canvas.context.translate(src.w * p.x, src.h * p.y);
        canvas.context.rotate(Math.PI * -0.5);
        canvas.context.translate(-src.h * p.y, -src.w * p.x);
        canvas.context.drawImage(image,
          f.x, f.y, f.h, f.w,
          s.y, s.x, s.h, s.w
        );
        canvas.context.restore();
      }

      return canvas;
    },

    /**
     * フレームを切り分けた配列をatlasFramesとしてAssetManagerにつっこむ
     * すでに存在すれば、 AssetManagerから取得する
     */ 
    getAtlasFrames: function() {
      var self = this;
      var atlasFrames = phina.asset.AssetManager.get('atlasFrames', self.key);
      if (atlasFrames) {
        return atlasFrames;
      }
      var data = self.data;
      var frames = data.frames;
      var meta = data.meta;
      if (frames instanceof Array == false) {
        frames = Object.keys(frames).map(function(key) {
          var frame = frames[key];
          frame.filename = key;
          return frame;
        });
      }

      atlasFrames = frames.map(function(frame) {
        var key = self.key + "/" + frame.filename;
        var canvas = phina.graphics.Canvas();

        var f = frame.frame;
        var s = frame.spriteSourceSize;
        var src = frame.sourceSize;
        var p = frame.pivot;

        var image = self.images[frame.image].domElement;

        canvas.setSize(s.w, s.h);
        if (!frame.rotated) {
          canvas.context.drawImage(image,
            f.x, f.y, f.w, f.h,
            0, 0, s.w, s.h
          );
        } else {
          canvas.context.save();
          canvas.context.translate(s.w * p.x, s.h * p.y);
          canvas.context.rotate(Math.PI * -0.5);
          canvas.context.translate(-s.h * p.y, -s.w * p.x);
          canvas.context.drawImage(image,
            f.x, f.y, f.h, f.w,
            0, 0, s.h, s.w
          );
          canvas.context.restore();
        }
        canvas.frame = frame;
        canvas.meta = meta;
        phina.asset.AssetManager.set('image', key, canvas);
        return canvas;
      });

      phina.asset.AssetManager.set('atlasFrames', self.key, atlasFrames);
      return atlasFrames;
    },

  });

  phina.asset.AssetLoader.register('atlas', function(key, src) {
    var asset = phina.asset.Atlas();
    return asset.load(key, src);
  });

  phina.define("phina.display.AtlasSprite", {
    superClass: "phina.display.DisplayElement",

    init: function(options) {
      options = ({}).$safe(options, phina.display.AtlasSprite.defaults);
      this.superInit(options);
      this.srcRect = phina.geom.Rect();
      this.dstRect = phina.geom.Rect();
      // this.srcPivot = phina.geom.Vector2();
      this.rotated = false;

      this.atlas = phina.asset.AssetManager.get("atlas", options.atlas);

      this.setFrame(options.frame);

      this.alpha = options.alpha;
    },

    setFrame: function(frameName) {
      var atlas = this.atlas;
      if (typeof (frameName) === "string") {
        this.frame = atlas.getFrameByName(frameName);
      } else {
        this.frame = atlas.data.frames.at(frameName);
      }

      this.image = atlas.images[this.frame.image];

      var f = this.frame.frame;
      var sss = this.frame.spriteSourceSize;
      var p = this.frame.pivot;
      this.srcRect.set(f.x, f.y, f.w, f.h);
      this.dstRect.set(sss.x, sss.y, sss.w, sss.h);
      this.width = this.frame.sourceSize.w;
      this.height = this.frame.sourceSize.h;
      if (atlas.data.meta.scale != "1") {
        var s = 1 / (+atlas.data.meta.scale);
        this.dstRect.x *= s;
        this.dstRect.y *= s;
        this.dstRect.width *= s;
        this.dstRect.height *= s;
        this.width *= s;
        this.height *= s;
      }
      // this.srcPivot.set(p.x, p.y);
      this.rotated = this.frame.rotated;

      return this;
    },

    draw: function(canvas) {
      var sr = this.srcRect;
      var dr = this.dstRect;
      // var p = this.srcPivot;
      var image = this.image.domElement;

      if (!this.rotated) {
        canvas.context.drawImage(image,
          sr.x, sr.y, sr.width, sr.height, -this._width * this.originX + dr.x, -this._height * this.originY + dr.y, dr.width, dr.height
        );
      } else {
        var ctx = canvas.context;
        ctx.save();
        ctx.rotate(Math.PI * -0.5);
        ctx.drawImage(image,
          sr.x, sr.y, sr.height, sr.width,
          this._height * (1 - this.originY) - dr.height - dr.y, -this._width * this.originX + dr.x, dr.height, dr.width
        );
        ctx.restore();
      }
    },

    _static: {
      defaults: {
        frame: 0,
        alpha: 1,
      },
    },

  });

  phina.define("phina.display.AtlasFrameSprite", {
    superClass: "phina.display.DisplayElement",
    _atlasIndex: 0,
    init: function(options) {
      if (typeof options === 'string') {
        options = {
          atlas: options,
        };
      }
      options = ({}).$safe(options, phina.display.AtlasFrameSprite.defaults);
      this.atlasName = options.atlas;
      this.atlas = phina.asset.AssetManager.get('atlas', this.atlasName);
      this.atlasFrames = this.atlas.getAtlasFrames();
      this.superInit();
      this.dstRect = phina.geom.Rect();
      // this.srcPivot = phina.geom.Vector2();

      this.setImage(this.atlasName);
      this.atlasIndex = options.atlasIndex;

      this.alpha = options.alpha;
    },

    setImage: function(image, width, height) {
      if (typeof image === 'string') {
        this.atlasFrames = phina.asset.AssetManager.get('atlas', image).getAtlasFrames();
        image = this.atlasFrames[this.atlasIndex];
      }
      this._image = image;
      this.width = this._image.domElement.width;
      this.height = this._image.domElement.height;

      if (width) { this.width = width; }
      if (height) { this.height = height; }

      return this;
    },

    setFrame: function(atlasIndex) {
      var image = this.image = this.atlasFrames.at(atlasIndex);
      this.frame = image.frame;
      var f = this.frame.frame;
      var ss = this.frame.sourceSize;
      var sss = this.frame.spriteSourceSize;
      var p = this.frame.pivot;
      var dr = this.dstRect;
      dr.set(sss.x, sss.y, sss.w, sss.h);

      dr.x -= ss.w * this.originX;
      dr.y -= ss.h * this.originY;
      if (image.meta.scale != "1") {
        var s = 1 / (+image.meta.scale);
        dr.x *= s;
        dr.y *= s;
        dr.width *= s;
        dr.height *= s;
        this.width *= s;
        this.height *= s;
      }
      // this.srcPivot.set(p.x, p.y);

      return this;
    },

    draw: function(canvas) {
      var dr = this.dstRect;
      // 一旦使ってない
      // var p = this.srcPivot;
      var image = this.image.domElement;

      canvas.context.drawImage(image, 0, 0, image.width, image.height, dr.x, dr.y, dr.width, dr.height);
    },

    _accessor: {
      image: {
        get: function() { return this._image; },
        set: function(v) {
          this.setImage(v);
          return this;
        }
      },
      atlasIndex: {
        get: function() {
          return this._atlasIndex;
        },
        set: function(v) {
          this._atlasIndex = v;
          this.setFrame(v);
        },
      }
    },

    _static: {
      defaults: {
        atlasIndex: 0,
        alpha: 1,
      },
    },

  });

});
//# sourceMappingURL=phina.atlas.js.map
