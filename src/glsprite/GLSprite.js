phina.namespace(() => {

  phina.define("GLSpriteArray", {

    init: function (gl, atlas, max, options) {
      options = ({}).$extend(GLSpriteArray.defaults, options);

      this.gl = gl;
      this.indexPool = Array.range(0, max);
      this.instances = [];

      this.atlas = phina.asset.AssetManager.get("atlas", atlas);
      this.image = this.atlas.images[Object.keys(this.atlas.images)[0]];
      this.texture = phigl.Texture(gl, this.image);
      this.max = max;

      this.depthEnabled = options.depthEnabled;
      this.blendMode = options.blendMode;

      if (GLSpriteArray.drawable == null) {
        const ext = phigl.Extensions.getInstancedArrays(gl);

        const program = phigl.Program(gl)
          .attach("glsprite.vs")
          .attach("glsprite.fs")
          .link();

        GLSpriteArray.drawable = phigl.InstancedDrawable(gl, ext)
          .setProgram(program)
          .setIndexValues([0, 1, 2, 1, 3, 2])
          .declareAttributes("position", "uv")
          .setAttributeDataArray([{
            unitSize: 2,
            data: [
              0, 1,
              1, 1,
              0, 0,
              1, 0,
            ]
          }, {
            unitSize: 2,
            data: [
              0, 1,
              1, 1,
              0, 0,
              1, 0,
            ],
          },])
          .createVao()
          .declareInstanceAttributes(
            "instanceActive",
            "instanceUvMatrix0",
            "instanceUvMatrix1",
            "instanceUvMatrix2",
            "instancePosition",
            "instanceSize",
            "instanceAlphaEnabled",
            "instanceAlpha",
            "instanceBrightness",
            "cameraMatrix0",
            "cameraMatrix1",
            "cameraMatrix2",
          )
          .declareUniforms("screenSize", "texture");
      }

      this.array = [];
      for (let i = 0; i < max; i++) {
        this.array.push(...[
          // active
          0,
          // uv matrix
          1, 0,
          0, 1,
          0, 0,
          // sprite position
          0, 0, 0,
          // sprite size
          0, 0,
          // sprite alpha enabled
          0,
          // sprite alpha
          1,
          // sprite brightness
          1,
          // camera matrix
          1, 0,
          0, 1,
          0, 0,
        ]);
      }
    },

    draw: function (gl) {
      const drawable = GLSpriteArray.drawable;

      if (this.depthEnabled) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }

      if (this.blendMode === "source-over") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else if (this.blendMode === "lighter") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
      } else {
        gl.disable(gl.BLEND);
      }

      for (let i = 0, len = this.instances.length; i < len; i++) {
        this.instances[i].updateAttributes(this.array);
      }

      drawable.uniforms["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
      drawable.uniforms["texture"].setValue(1).setTexture(this.texture);

      drawable.setInstanceAttributeData(this.array);
      drawable.draw(this.max);
    },

    dispose: function () {

    },

    _static: {
      defaults: {
        depthEnabled: true,
        blendMode: "source-over",
      },
      drawable: null,
    },
  });

  phina.define("GLSprite", {
    superClass: "phina.display.DisplayElement",

    init: function (params) {
      params = ({}).$extend(GLSprite.defaults, params);
      this.superInit(params);

      this.spriteArray = params.spriteArray;
      this.alphaEnabled = params.alphaEnabled;
      this.brightness = params.brightness;
      if (this.alphaEnabled) {
        this.instanceIndex = this.spriteArray.indexPool.pop();
      } else {
        this.instanceIndex = this.spriteArray.indexPool.shift();
      }
      this.uvMatrix = Matrix33();

      this.setImage(params.image);

      this.spriteArray.instances.push(this);

      this.z = 0;
    },

    setImage: function (image) {
      const frame = this.spriteArray.atlas.getFrameByName(image);
      const imgW = this.spriteArray.image.domElement.width;
      const imgH = this.spriteArray.image.domElement.height;

      const f = frame.frame;
      const texX = f.x;
      const texY = f.y;
      const texW = f.w;
      const texH = f.h;

      const uvm = this.uvMatrix;
      uvm.m00 = texW / imgW;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / imgH;
      uvm.m02 = texX / imgW;
      uvm.m12 = texY / imgH;

      this.width = f.w;
      this.height = f.h;
    },

    setZ: function (v) {
      this.z = v;
      return this;
    },

    setAlpha: function (v) {
      this.alpha = v;
      return this;
    },

    setBrightness: function (v) {
      this.brightness = v;
      return this;
    },

    dispose: function () {
      if (this.alphaEnabled) {
        this.spriteArray.indexPool.push(this.instanceIndex);
      } else {
        this.spriteArray.indexPool.unshift(this.instanceIndex);
      }
      this.spriteArray.instances.erase(this);
      this.instanceIndex = undefined;
    },

    updateAttributes: function (array) {
      if (this.instanceIndex === undefined) return;

      const idx = this.instanceIndex;
      const uvm = this.uvMatrix;
      const m = this._worldMatrix;

      const size = 21;

      // active
      array[idx * size + 0] = (this.parent && this.visible) ? 1 : 0;
      if (this.parent && this.visible) {
        // uv matrix
        array[idx * size + 1] = uvm.m00;
        array[idx * size + 2] = uvm.m10;
        array[idx * size + 3] = uvm.m01;
        array[idx * size + 4] = uvm.m11;
        array[idx * size + 5] = uvm.m02;
        array[idx * size + 6] = uvm.m12;
        // sprite position
        array[idx * size + 7] = -this.width * this.originX;
        array[idx * size + 8] = -this.height * this.originY;
        array[idx * size + 9] = this.z;
        // sprite size
        array[idx * size + 10] = this.width;
        array[idx * size + 11] = this.height;
        // sprite alpha enabled
        array[idx * size + 12] = this.alphaEnabled ? 1 : 0;
        // sprite alpha
        array[idx * size + 13] = this._worldAlpha;
        // sprite brightness
        array[idx * size + 14] = this.brightness;
        // camera matrix
        array[idx * size + 15] = m.m00;
        array[idx * size + 16] = m.m10;
        array[idx * size + 17] = m.m01;
        array[idx * size + 18] = m.m11;
        array[idx * size + 19] = m.m02;
        array[idx * size + 20] = m.m12;
      }
    },

    _static: {
      defaults: {
        alphaEnabled: false,
        brightness: 1.0,
      },
    },
  });

});
