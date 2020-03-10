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

        console.log("drawable start");

        GLSpriteArray.drawable = phigl.InstancedDrawable(gl, ext)
          .setProgram(program)
          .setIndexValues([0, 1, 2, 1, 3, 2])
          .declareAttributes("posuv")
          .setAttributeDataArray([{
            // position, uv
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
            "instanceUvMatrix0",
            "instanceUvMatrix1",
            "instanceUvMatrixN0",
            "instanceUvMatrixN1",
            "instanceUvMatrixE0",
            "instanceUvMatrixE1",
            "instancePosition",
            "instanceSize",
            "cameraMatrix0",
            "cameraMatrix1",
          )
          .declareUniforms(
            "screenSize",
            "texture",
            "ambientColor",
            "lightColor",
            "lightPower",
            "lightPosition",
          );

        console.log("drawable ok");
      }

      this.array = [];
      for (let i = 0; i < max; i++) {
        this.array.push(...[
          // uv matrix
          1, 0,
          0, 1,
          0, 0,
          // uv matrix normal
          1, 0,
          0, 1,
          0, 0,
          // // uv matrix emission
          1, 0,
          0, 1,
          0, 0,
          // sprite position
          0, 0, 0,
          // sprite size ( + active)
          0, 0, 0,
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

      const uni = drawable.uniforms;
      uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
      uni["texture"].setValue(0).setTexture(this.texture);
      uni["ambientColor"].setValue(ambientColor);
      for (let i = 0; i < 10; i++) {
        uni[`lightColor[${i}]`].setValue(lightColor[i]);
        uni[`lightPower[${i}]`].setValue(lightPower[i]);
        uni[`lightPosition[${i}]`].setValue(pos[i]);
      }

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
      this.uvMatrixN = Matrix33();
      this.uvMatrixE = Matrix33();

      this.setImage(params.image);
      this.setNormalMap(params.normalMap);
      this.setEmissionMap(params.emissionMap);

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

    setNormalMap: function (image) {
      const frame = this.spriteArray.atlas.getFrameByName(image);
      const imgW = this.spriteArray.image.domElement.width;
      const imgH = this.spriteArray.image.domElement.height;

      const f = frame.frame;
      const texX = f.x;
      const texY = f.y;
      const texW = f.w;
      const texH = f.h;

      const uvm = this.uvMatrixN;
      uvm.m00 = texW / imgW;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / imgH;
      uvm.m02 = texX / imgW;
      uvm.m12 = texY / imgH;
    },

    setEmissionMap: function (image) {
      const frame = this.spriteArray.atlas.getFrameByName(image);
      const imgW = this.spriteArray.image.domElement.width;
      const imgH = this.spriteArray.image.domElement.height;

      const f = frame.frame;
      const texX = f.x;
      const texY = f.y;
      const texW = f.w;
      const texH = f.h;

      const uvm = this.uvMatrixE;
      uvm.m00 = texW / imgW;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / imgH;
      uvm.m02 = texX / imgW;
      uvm.m12 = texY / imgH;
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
      const uvmN = this.uvMatrixN;
      const uvmE = this.uvMatrixE;
      const m = this._worldMatrix;

      const size = 30;

      // active
      array[idx * size + 23] = (this.parent && this.visible) ? 1 : 0;
      if (this.parent && this.visible) {
        // uv matrix
        array[idx * size + 0] = uvm.m00;
        array[idx * size + 1] = uvm.m10;
        array[idx * size + 2] = uvm.m01;
        array[idx * size + 3] = uvm.m11;
        array[idx * size + 4] = uvm.m02;
        array[idx * size + 5] = uvm.m12;
        // uv matrix normal
        array[idx * size + 6] = uvmN.m00;
        array[idx * size + 7] = uvmN.m10;
        array[idx * size + 8] = uvmN.m01;
        array[idx * size + 9] = uvmN.m11;
        array[idx * size + 10] = uvmN.m02;
        array[idx * size + 11] = uvmN.m12;
        // // uv matrix emission
        array[idx * size + 12] = uvmE.m00;
        array[idx * size + 13] = uvmE.m10;
        array[idx * size + 14] = uvmE.m01;
        array[idx * size + 15] = uvmE.m11;
        array[idx * size + 16] = uvmE.m02;
        array[idx * size + 17] = uvmE.m12;
        // sprite position
        array[idx * size + 18] = -this.width * this.originX;
        array[idx * size + 19] = -this.height * this.originY;
        array[idx * size + 20] = this.z;
        // sprite size
        array[idx * size + 21] = this.width;
        array[idx * size + 22] = this.height;
        // camera matrix
        array[idx * size + 24] = m.m00;
        array[idx * size + 25] = m.m10;
        array[idx * size + 26] = m.m01;
        array[idx * size + 27] = m.m11;
        array[idx * size + 28] = m.m02;
        array[idx * size + 29] = m.m12;
      }
    },

    _static: {
      defaults: {
        alphaEnabled: false,
        normalMap: "no_normal.png",
        emissionMap: "black.png"
      },
    },
  });

});
