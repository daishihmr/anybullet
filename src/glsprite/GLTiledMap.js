phina.namespace(() => {

  phina.define("GLTiledMap", {
    superClass: "DisplayElement",

    z: 0,

    init: function (options) {
      options = ({}).$extend(GLTiledMap.defaults, options);
      this.superInit(options);

      this.depthEnabled = options.depthEnabled;
      this.alphaEnabled = options.alphaEnabled;
      this.brightness = options.brightness;
      this.blendMode = options.blendMode;

      const gl = options.gl;

      if (typeof (options.tiledAsset) == "string") {
        this.tiledAsset = AssetManager.get("tiled", options.tiledAsset);
      } else {
        this.tiledAsset = options.tiledAsset;
      }
      this.layer = options.layer;

      const tilesets = this.tiledAsset.tilesets;
      this.textures = tilesets.map(ts => phigl.Texture(gl, ts.image));
      this.normalMaps = tilesets.map(ts => phigl.Texture(gl, ts.normalImage));

      const cols = this.tiledAsset.json.width;
      const rows = this.tiledAsset.json.height;
      this.tilewidth = this.tiledAsset.json.tilewidth;
      this.tileheight = this.tiledAsset.json.tileheight;

      this.width = cols * this.tilewidth;
      this.height = rows * this.tileheight;
      this.originX = 0;
      this.originY = 0;

      const data = this.tiledAsset.json.layers[this.layer].data;

      const indices = [];
      const positions = [];
      const textureIndices = [];
      const uvs = [];
      tilesets.push({ firstgid: Number.MAX_VALUE });
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          const cell = data[idx];

          if (cell == 0) continue;

          const textureIndex = tilesets.indexOf(tilesets.find(ts => cell < ts.firstgid)) - 1;
          const uv = tilesets[textureIndex].calcUv(cell);

          indices.push(
            idx * 4 + 0,
            idx * 4 + 1,
            idx * 4 + 2,
            idx * 4 + 1,
            idx * 4 + 3,
            idx * 4 + 2,
          );
          positions.push(
            x + 0, y + 1,
            x + 1, y + 1,
            x + 0, y + 0,
            x + 1, y + 0,
          );
          textureIndices.push(
            textureIndex,
            textureIndex,
            textureIndex,
            textureIndex,
          );
          uvs.push(...uv);
        }
      }
      tilesets.pop();

      if (GLTiledMap.program == null) {
        GLTiledMap.program = phigl.Program(gl)
          .attach("gltiledmap.vs")
          .attach("gltiledmap.fs")
          .link();
      }
      this.drawable = phigl.Drawable(gl)
        .setProgram(GLTiledMap.program)
        .setIndexValues(indices)
        .declareAttributes("position", "uv", "textureIndex")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions,
        }, {
          unitSize: 2,
          data: uvs,
        }, {
          unitSize: 1,
          data: textureIndices,
        }])
        .createVao()
        .declareUniforms(
          "instanceActive",
          "instancePosition",
          "instanceSize",
          "instanceAlphaEnabled",
          "instanceAlpha",
          "instanceBrightness",
          "cameraMatrix0",
          "cameraMatrix1",
          "cameraMatrix2",
          "screenSize",
          "texture",
          "texture_n",
          "ambientColor",
          "lightColor",
          "lightPower",
          "lightPosition",
        );
    },

    setZ: function (v) {
      this.z = v;
      return this;
    },

    draw: function (gl) {
      const drawable = this.drawable;

      if (this.depthEnabled) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }

      if (this.blendMode === "source-over") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else if (this.options.blendMode === "lighter") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
      } else {
        gl.disable(gl.BLEND);
      }

      const m = this._worldMatrix;
      const uni = drawable.uniforms;
      uni["instanceActive"].setValue((this.parent && this.visible) ? 1 : 0);
      if (this.parent && this.visible) {
        uni["instancePosition"].setValue([-this.width * this.originX, -this.height * this.originY, this.z]);
        uni["instanceSize"].setValue([this.tilewidth, this.tileheight]);
        uni["instanceAlphaEnabled"].setValue(this.alphaEnabled ? 1 : 0);
        uni["instanceAlpha"].setValue(this._worldAlpha);
        uni["instanceBrightness"].setValue(this.brightness);
        uni["cameraMatrix0"].setValue([m.m00, m.m10]);
        uni["cameraMatrix1"].setValue([m.m01, m.m11]);
        uni["cameraMatrix2"].setValue([m.m02, m.m12]);
        uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
        for (let i = 0, len = this.textures.length; i < len; i++) {
          uni[`texture[${i}]`].setValue(i).setTexture(this.textures[i]);
        }
        for (let i = 0, len = this.normalMaps.length; i < len; i++) {
          uni[`texture_n[${i}]`].setValue(8 + i).setTexture(this.normalMaps[i]);
        }
        uni["ambientColor"].setValue([0.1, 0.1, 0.1, 1.0]);
        for (let i = 0; i < 10; i++) {
          uni[`lightColor[${i}]`].setValue([1.0, 1.0, 1.0, 1.0]);
          uni[`lightPower[${i}]`].setValue(lightPower);
          uni[`lightPosition[${i}]`].setValue(pos[i]);
        }
      }

      drawable.draw();
    },

    _static: {
      defaults: {
        layer: 0,
        depthEnabled: true,
        blendMode: "source-over",
        alphaEnabled: false,
        brightness: 1.0,
      },
      program: null,
    }
  });

});
