phina.namespace(() => {

  phina.define("GLTiledMap", {
    superClass: "DisplayElement",

    z: 0,

    init: function (options) {
      options = ({}).$extend(GLTiledMap.defaults, options);
      this.superInit(options);

      this.blendMode = options.blendMode;

      const gl = options.gl;

      if (typeof (options.tiledAsset) == "string") {
        this.tiledAsset = AssetManager.get("tiled", options.tiledAsset);
      } else {
        this.tiledAsset = options.tiledAsset;
      }

      const tilesets = this.tiledAsset.tilesets;
      this.textures = tilesets.map(ts => TextureAsset.get(gl, ts.image));
      this.normalMaps = tilesets.map(ts => TextureAsset.get(gl, ts.normalImage));
      this.emissionMaps = tilesets.map(ts => TextureAsset.get(gl, ts.emissionImage));

      const cols = this.tiledAsset.json.width;
      const rows = this.tiledAsset.json.height;
      this.tilewidth = this.tiledAsset.json.tilewidth;
      this.tileheight = this.tiledAsset.json.tileheight;

      this.width = cols * this.tilewidth;
      this.height = rows * this.tileheight;
      this.originX = 0;
      this.originY = 0;

      const indices = [];
      const positions = [];
      const textureIndices = [];
      const uvs = [];

      let offset = 0;
      this.tiledAsset.json.layers.filter(l => l.type == "tilelayer").reverse().forEach((layer, layerIndex) => {
        const data = layer.data;

        tilesets.push({ firstgid: Number.MAX_VALUE });
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            const cell = data[idx];

            if (cell == 0) continue;

            const textureIndex = tilesets.indexOf(tilesets.find(ts => cell < ts.firstgid)) - 1;
            const uv = tilesets[textureIndex].calcUv(cell);

            indices.push(
              offset + 0,
              offset + 1,
              offset + 2,
              offset + 1,
              offset + 3,
              offset + 2,
            );
            positions.push(
              x + 0, y + 1, layerIndex * -0.01,
              x + 1, y + 1, layerIndex * -0.01,
              x + 0, y + 0, layerIndex * -0.01,
              x + 1, y + 0, layerIndex * -0.01,
            );
            offset += 4;
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
      });

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
          unitSize: 3,
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
          "instanceAlpha",
          "cameraMatrix0",
          "cameraMatrix1",
          "cameraMatrix2",
          "screenSize",
          "texture",
          "texture_n",
          "texture_e",
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

    draw: function (gl, lighting) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const m = this._worldMatrix;

      const drawable = this.drawable;
      const uni = drawable.uniforms;
      uni["instanceActive"].setValue((this.parent && this.visible) ? 1 : 0);
      if (this.parent && this.visible) {
        uni["instancePosition"].setValue([-this.width * this.originX, -this.height * this.originY, this.z]);
        uni["instanceSize"].setValue([this.tilewidth, this.tileheight]);
        uni["instanceAlpha"].setValue(this._worldAlpha);
        uni["cameraMatrix0"].setValue([m.m00, m.m10]);
        uni["cameraMatrix1"].setValue([m.m01, m.m11]);
        uni["cameraMatrix2"].setValue([m.m02, m.m12]);
        uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
        for (let i = 0, len = this.textures.length; i < len; i++) {
          uni[`texture[${i}]`].setValue(4 * 0 + i).setTexture(this.textures[i]);
        }
        for (let i = 0, len = this.normalMaps.length; i < len; i++) {
          uni[`texture_n[${i}]`].setValue(4 * 1 + i).setTexture(this.normalMaps[i]);
        }
        for (let i = 0, len = this.emissionMaps.length; i < len; i++) {
          uni[`texture_e[${i}]`].setValue(4 * 2 + i).setTexture(this.emissionMaps[i]);
        }
        lighting.set(drawable);
      }

      drawable.draw();
    },

    _static: {
      defaults: {
        layer: 0,
      },
      program: null,
    }
  });

});
