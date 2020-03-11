phina.namespace(() => {

  const texSize = 32;
  const posX = x => (-texSize / 2 + (x * 4 + 2)) / (texSize / 2);
  const posY = y => (texSize / 2 - (y * 4 + 2)) / (texSize / 2);
  const uvX = x => x * 4 / texSize;
  const uvY = y => 1 - y * 4 / texSize;

  phina.define("megaparticle.ParticleSystem", {
    _static: {
      texSize: texSize,
    },

    init: function ({ gl }) {
      if (gl.getExtension("OES_texture_float") == null) throw "Float Textureに対応してないらしいよ";
      if (gl.getExtension("WEBGL_color_buffer_float") == null) throw "Float Textureに対応してないらしいよ";

      this.gl = gl;
      this.time = 0;

      this.framebufferA = phigl.FloatTexFramebuffer(gl, texSize, texSize);
      this.framebufferB = phigl.FloatTexFramebuffer(gl, texSize, texSize);
      this.textures = {};
      this.textureNames = [];

      this.setupInitializer();
      this.setupEmitter();
      this.setupUpdater();
      this.setupDrawer();
    },

    registerTexture: function (name, image) {
      if (this.textures[name] == null) {
        this.textures[name] = phigl.Texture(this.gl, image);
        this.textureNames.push(name);
      }
    },

    setupInitializer: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_init.vs")
        .attach("mega_init.fs")
        .link();
      const positions = [];
      for (let y = 0; y < texSize / 4; y++) {
        for (let x = 0; x < texSize / 4; x++) {
          positions.push(...[
            posX(x), posY(y)
          ]);
        }
      }
      this.drawableInit = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(Array.range(0, (texSize / 4) * (texSize / 4)))
        .declareAttributes("position")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions
        }])
        .createVao()
        .declareUniforms(
          "texSize",
        )
        .setDrawMode(gl.POINTS);
    },

    initialize: function () {
      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      this.drawableInit.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();
    },

    setupEmitter: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_emit.vs")
        .attach("mega_emit.fs")
        .link();
      this.drawableEmit = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0])
        .createVao()
        .declareUniforms(
          "position",
          "time",
          "data0",
          "data1",
          "data2",
        )
        .setDrawMode(gl.POINTS);
    },

    emit: function (params) {
      const gl = this.gl;

      this.framebufferA.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);

      const drawable = this.drawableEmit;
      const x = params.index % (texSize / 4);
      const y = Math.floor(params.index / (texSize / 4));
      drawable.uniforms["position"].setValue([posX(x), posY(y)]);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["data0"].setValue([
        // [0]
        params.emitterPositionX,
        params.emitterPositionY,
        params.sourcePositionVariancex,
        params.sourcePositionVariancey,
        // [1]
        params.startParticleSize,
        params.startParticleSizeVariance,
        params.finishParticleSize,
        params.finishParticleSizeVariance,
        // [2]
        params.rotationStart,
        params.rotationStartVariance,
        params.rotationEnd,
        params.rotationEndVariance,
        // [3]
        params.startColorRed,
        params.startColorVarianceRed,
        params.finishColorRed,
        params.finishColorVarianceRed,
      ]);
      drawable.uniforms["data1"].setValue([
        // [0]
        params.startColorGreen,
        params.startColorVarianceGreen,
        params.finishColorGreen,
        params.finishColorVarianceGreen,
        // [1]
        params.startColorBlue,
        params.startColorVarianceBlue,
        params.finishColorBlue,
        params.finishColorVarianceBlue,
        // [2]
        params.startColorAlpha,
        params.startColorVarianceAlpha,
        params.finishColorAlpha,
        params.finishColorVarianceAlpha,
        // [3]
        params.angle,
        params.angleVariance,
        params.speed,
        params.speedVariance,
      ]);
      drawable.uniforms["data2"].setValue([
        // [0]
        params.gravityx,
        params.gravityy,
        params.radialAcceleration,
        params.radialAccelVariance,
        // [1]
        params.tangentialAcceleration,
        params.tangentialAccelVariance,
        params.particleLifespan,
        params.particleLifespanVariance,
        // [2]
        this.textureNames.indexOf(params.textureFileName),
        0,
        0,
        0,
        // [3]
        0, 0, 0, 0,
      ]);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);
    },

    setupUpdater: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_update.vs")
        .attach("mega_update.fs")
        .link();
      const positions = [];
      const dataUvs = [];
      for (let y = 0; y < texSize / 4; y++) {
        for (let x = 0; x < texSize / 4; x++) {
          positions.push(...[
            posX(x), posY(y)
          ]);
          dataUvs.push(...[
            x, texSize - y,
          ]);
        }
      }
      this.drawableUpdate = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(Array.range(0, (texSize / 4) * (texSize / 4)))
        .declareAttributes("position", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions
        }, {
          unitSize: 2,
          data: dataUvs
        }])
        .createVao()
        .declareUniforms(
          "texture",
          "texSize",
          "time",
          "deltaTime",
          "emitterPosition",
        )
        .setDrawMode(gl.POINTS);
    },

    update: function (deltaTime) {
      this.time += deltaTime;

      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);

      const drawable = this.drawableUpdate;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["deltaTime"].setValue(deltaTime);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();
    },

    setupDrawer: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_draw.vs")
        .attach("mega_draw.fs")
        .link();
      const indices = [];
      const positions = [];
      const uvs = [];
      const dataUvs = [];
      let offset = 0;
      for (let y = 0; y < texSize; y += 4) {
        for (let x = 0; x < texSize; x += 4) {
          indices.push(...[
            offset + 0, offset + 1, offset + 2,
            offset + 1, offset + 3, offset + 2,
          ]);
          offset += 4;
          positions.push(...[
            -0.5, 0.5,
            0.5, 0.5,
            -0.5, -0.5,
            0.5, -0.5,
          ]);
          uvs.push(...[
            0, 0,
            1, 0,
            0, 1,
            1, 1,
          ]);
          dataUvs.push(...[
            x, texSize - y,
            x, texSize - y,
            x, texSize - y,
            x, texSize - y,
          ]);
        }
      }
      this.drawableDraw = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(indices)
        .declareAttributes("position", "uv", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions,
        }, {
          unitSize: 2,
          data: uvs,
        }, {
          unitSize: 2,
          data: dataUvs,
        }])
        .createVao()
        .declareUniforms(
          "texture",
          "texSize",
          "time",
          "screenSize",
          "particleTexture0",
          "particleTexture1",
          "particleTexture2",
          "particleTexture3",
          "particleTexture4",
          "particleTexture5",
          "particleTexture6",
          "particleTexture7",
        )
        .setDrawMode(gl.TRIANGLES);
    },

    draw: function (canvasWidth, canvasHeight) {
      const gl = this.gl;

      phigl.FloatTexFramebuffer.unbind(gl);
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      const drawable = this.drawableDraw;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["screenSize"].setValue([canvasWidth, canvasHeight]);
      for (let i = 0, len = this.textureNames.length; i < len; i++) {
        drawable.uniforms["particleTexture" + i].setValue(1 + i).setTexture(this.textures[this.textureNames[i]]);
      }
      drawable.draw();
    },

    swapBuffer: function () {
      [this.framebufferA, this.framebufferB] = [this.framebufferB, this.framebufferA];
    },

    test: function () {
      const program = phigl.Program(gl)
        .attach("mega_test.vs")
        .attach("mega_test.fs")
        .link();
      const drawable = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            -1, 1,
            1, 1,
            -1, -1,
            1, -1,
          ],
        }, {
          unitSize: 2,
          data: [
            0, 1,
            1, 1,
            0, 0,
            1, 0,
          ],
        }])
        .createVao()
        .declareUniforms(
          "texture",
        )
        .setDrawMode(gl.TRIANGLES);

      phigl.FloatTexFramebuffer.unbind(gl);
      gl.viewport(0, 0, 32, 32);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.draw();

      console.log("test ok");
    },

    setupSet: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_set.vs")
        .attach("mega_set.fs")
        .link();
      this.drawableSet = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0])
        .createVao()
        .declareUniforms(
          "position",
          "section0",
          "section1",
          "section2",
          "section3",
          "section4",
          "section5",
          "section6",
          "section7",
          "section8",
          "section9",
          "section10",
          "section11",
          "section12",
          "section13",
          "section14",
          "section15",
        )
        .setDrawMode(gl.POINTS);
    },

    set: function (params) {
      const gl = this.gl;

      this.framebufferA.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);

      const drawable = this.drawableSet;
      const x = params.index % (texSize / 4);
      const y = Math.floor(params.index / (texSize / 4));
      drawable.uniforms["position"].setValue([posX(x), posY(y)]);
      drawable.uniforms["section0"].setValue(params.section0 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section1"].setValue(params.section1 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section2"].setValue(params.section2 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section3"].setValue(params.section3 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section4"].setValue(params.section4 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section5"].setValue(params.section5 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section6"].setValue(params.section6 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section7"].setValue(params.section7 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section8"].setValue(params.section8 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section9"].setValue(params.section9 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section10"].setValue(params.section10 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section11"].setValue(params.section11 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section12"].setValue(params.section12 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section13"].setValue(params.section13 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section14"].setValue(params.section14 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section15"].setValue(params.section15 || [0.0, 0.0, 0.0, 0.0]);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);
    },

    setupCopy: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_copy.vs")
        .attach("mega_copy.fs")
        .link();
      const indices = [];
      const positions = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        indices.push(index);
        positions.push(...[
          posX(x), posY(y)
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
        ]);
      }
      this.drawableCopy = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(indices)
        .declareAttributes("position", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions
        }, {
          unitSize: 2,
          data: dataUvs
        }])
        .createVao()
        .declareUniforms(
          "texture",
          "texSize",
        )
        .setDrawMode(gl.POINTS);
    },

    copy: function () {
      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);

      const drawable = this.drawableCopy;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();
    },

  });

});
