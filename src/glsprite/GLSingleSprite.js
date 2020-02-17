phina.namespace(() => {

  /**
   * インスタンシングを使わないやつ
   */
  phina.define("GLSingleSprite", {

    superClass: "DisplayElement",

    z: 0,

    init: function (options) {
      options = ({}).$extend(GLSingleSprite.defaults, options);
      this.superInit(options);

      if (typeof (options.image) == "string") {
        this.image = AssetManager.get("image", options.image);
      } else {
        this.image = options.image;
      }
      this.width = this.image.domElement.width;
      this.height = this.image.domElement.height;

      this.depthEnabled = options.depthEnabled;
      this.blendMode = options.blendMode;
      this.alphaEnabled = options.alphaEnabled;
      this.brightness = options.brightness;

      const gl = options.gl;
      this.texture = phigl.Texture(gl, this.image);

      if (GLSingleSprite.drawable == null) {
        const program = phigl.Program(gl)
          .attach("glsinglesprite.vs")
          .attach("glsinglesprite.fs")
          .link();
        GLSingleSprite.drawable = phigl.Drawable(gl)
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
            "texture"
          );
      }
    },

    setZ: function (v) {
      this.z = v;
      return this;
    },

    draw: function (gl) {
      const drawable = GLSingleSprite.drawable;

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
        uni["instanceSize"].setValue([this.width, this.height]);
        uni["instanceAlphaEnabled"].setValue(this.alphaEnabled ? 1 : 0);
        uni["instanceAlpha"].setValue(this._worldAlpha);
        uni["instanceBrightness"].setValue(this.brightness);
        uni["cameraMatrix0"].setValue([m.m00, m.m10]);
        uni["cameraMatrix1"].setValue([m.m01, m.m11]);
        uni["cameraMatrix2"].setValue([m.m02, m.m12]);
        uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
        uni["texture"].setValue(1).setTexture(this.texture);
      }

      drawable.draw();
    },

    _static: {
      defaults: {
        depthEnabled: true,
        blendMode: "source-over",
        alphaEnabled: false,
        brightness: 1.0,
      },
      program: null,
    },
  });

});
