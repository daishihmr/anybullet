phina.namespace(() => {

  const texSize = 1024;
  const posX = x => (-texSize / 2 + (x * 4 + 2)) / (texSize / 2);
  const posY = y => (texSize / 2 - (y * 4 + 2)) / (texSize / 2);
  const uvX = x => x * 4 / texSize;
  const uvY = y => 1 - y * 4 / texSize;

  phina.define("megaparticle.ParticleSystem", {
    superClass: "phina.app.Element",

    _static: {
      texSize: texSize,
    },

    init: function ({ gl }) {
      this.superInit();
      console.log("megaparticle準備中");

      if (gl.getExtension("OES_texture_float") == null) throw "Float Textureに対応してないらしいよ";
      if (gl.getExtension("WEBGL_color_buffer_float") == null) throw "Float Textureに対応してないらしいよ";
      if (gl.getExtension("OES_element_index_uint") == null) throw "drawElemnetsのインデックスにuint使えないらしいよ";

      this.gl = gl;
      this.time = 0;

      this.framebufferA = phigl.FloatTexFramebuffer(gl, texSize, texSize);
      this.framebufferB = phigl.FloatTexFramebuffer(gl, texSize, texSize);
      this.textures = {};
      this.textureNames = [];
      this.reservedStopIndices = [];
      this.velocityUpdateTime = 0;

      this._setupStarter();
      this._setupStoper();
      this._setupUpdater();
      this._setupDrawer();

      this._setupCopy();
      this._setupSet();

      this.freeIndex = 0;

      this.movableEmitters = [];

      this.framebufferA.bind();
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      phigl.FloatTexFramebuffer.unbind(gl);

      this.framebufferB.bind();
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      phigl.FloatTexFramebuffer.unbind(gl);

      console.log("megaparticle準備完了");
    },

    addMovableEmitter: function(emitter) {
      if (this.movableEmitters.length < 8) {
        this.movableEmitters.push(emitter);
      } else {
        console.error("movableEmitterは8個までだよ");
      }
    },

    removeMovableEmitter: function(emitter) {
      this.movableEmitters.erase(emitter);
    },

    delete: function () {
      this.framebufferA.delete();
      this.framebufferB.delete();
      this.drawableStart.delete();
      this.drawableStop.delete();
      this.drawableUpdate.delete();
      this.drawableDraw.delete();
      this.drawableSet.delete();
      this.drawableCopy.delete();
      this.textureNames.forEach(name => this.textures[name].delete());
    },

    swapBuffer: function () {
      [this.framebufferA, this.framebufferB] = [this.framebufferB, this.framebufferA];
    },

    getIndices: function (count) {
      const max = (texSize / 4) * (texSize / 4);
      const start = this.freeIndex;
      this.freeIndex += count;
      if (start + count < max) {
        return Array.range(start, start + count);
      } else {
        throw `パーティクルたりないよ (要求：${start + count}、最大：${max})`;
      }
    },

    createEmitter: function (json) {
      return megaparticle.Emitter(json, this);
    },

    registerTexture: function (name, image) {
      if (this.textures[name] == null) {
        this.textures[name] = phigl.Texture(this.gl, image, (gl) => {
          // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        });
        this.textureNames.push(name);
      }
    },

    _setupStarter: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_start.vs")
        .attach("mega_start.fs")
        .link();
      this.drawableStart = phigl.Drawable32(gl)
        .setProgram(program)
        .setIndexValues([])
        .declareAttributes("index")
        .setAttributeDataArray([{
          unitSize: 1,
          data: Array.range(0, (texSize / 4) * (texSize / 4)),
        }])
        .createVao()
        .declareUniforms(
          "texSize",
          "time",
          "data0",
          "data1",
          "data2",
          "randomFactor",
        )
        .setDrawMode(gl.POINTS);
    },

    start: function (emitterId, x, y, z, indices, params) {
      const gl = this.gl;
      const emitInterval = params.particleLifespan / params.maxParticles;

      this.framebufferA.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const drawable = this.drawableStart;
      drawable.setIndexValues(indices);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["randomFactor0"].setValue([phina.util.Random.random(), phina.util.Random.random()]);
      drawable.uniforms["randomFactor1"].setValue([phina.util.Random.random(), phina.util.Random.random()]);
      drawable.uniforms["data0"].setValue([
        // [0]
        x,
        y,
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
        params.duration < 0 ? 1.0 : 0.0,
        emitInterval,
        // [3]
        indices[0],
        params.blendFuncDestination == 1 ? 1 : 0,
        emitterId,
        z,
      ]);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);
    },

    _setupStoper: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_stop.vs")
        .attach("mega_stop.fs")
        .link();
      const positions = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        positions.push(...[
          posX(x), posY(y)
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
        ]);
      }
      this.drawableStop = phigl.Drawable32(gl)
        .setProgram(program)
        .setIndexValues([])
        .declareAttributes("position", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions,
        }, {
          unitSize: 2,
          data: dataUvs
        }])
        // .createVao()
        .declareUniforms(
          "texture",
          "texSize",
        )
        .setDrawMode(gl.POINTS);
    },

    reserveStop: function (indices) {
      this.reservedStopIndices.push(...indices);
    },

    execStop: function () {
      if (this.reservedStopIndices.length == 0) return;

      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const drawable = this.drawableStop;
      drawable.setIndexValues(this.reservedStopIndices);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();
      this.copy();

      this.reservedStopIndices.clear();
    },

    _setupUpdater: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_update.vs")
        .attach("mega_update.fs")
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
      this.drawableUpdate = phigl.Drawable32(gl)
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
          "time",
          "deltaTime",
          "deltaPosition",
          "moveEmitterIndex[0]",
          "moveEmitterPosition[0]",
        )
        .setDrawMode(gl.POINTS);
    },

    update: function (deltaPosition = [0, 0], deltaSec = 0.0166) { // 0.0166 = 1 / 60
      this.execStop();

      this.time += deltaSec;
      this.velocityUpdateTime -= deltaSec;

      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const drawable = this.drawableUpdate;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["deltaTime"].setValue(deltaSec);
      drawable.uniforms["deltaPosition"].setValue(deltaPosition);
      for (let i = 0; i < 8; i++) {
        if (i < this.movableEmitters.length) {
          const movableEmitter = this.movableEmitters[i];
          drawable.uniforms[`moveEmitterIndex[${i}]`].setValue(movableEmitter.id);
          drawable.uniforms[`moveEmitterPosition[${i}]`].setValue([movableEmitter.x, movableEmitter.y, movableEmitter.z]);
        } else {
          drawable.uniforms[`moveEmitterIndex[${i}]`].setValue(-1);
          drawable.uniforms[`moveEmitterPosition[${i}]`].setValue([0, 0, 0]);
        }
      }
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();

      if (this.velocityUpdateTime <= 0) {
        this.velocityUpdateTime = 1 / 10;
      }
    },

    _setupDrawer: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_draw.vs")
        .attach("mega_draw.fs")
        .link();
      const indices = [];
      const positions = [];
      const uvs = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        indices.push(...[
          index * 4 + 0, index * 4 + 1, index * 4 + 2,
          index * 4 + 1, index * 4 + 3, index * 4 + 2,
        ]);
        positions.push(...[
          -0.5, 0.5,
          0.5, 0.5,
          -0.5, -0.5,
          0.5, -0.5,
        ]);
        uvs.push(...[
          0, 1,
          1, 1,
          0, 0,
          1, 0,
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
          uvX(x), uvY(y),
          uvX(x), uvY(y),
          uvX(x), uvY(y),
        ]);
      }

      this.drawableDraw = phigl.Drawable32(gl)
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

      // gl.disable(gl.CULL_FACE);
      // gl.disable(gl.DEPTH_TEST);
      // gl.enable(gl.BLEND);
      // gl.blendEquation(gl.FUNC_ADD);
      // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const drawable = this.drawableDraw;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["screenSize"].setValue([canvasWidth, canvasHeight]);
      for (let i = 0, len = this.textureNames.length; i < len; i++) {
        drawable.uniforms["particleTexture" + i].setValue(1 + i).setTexture(this.textures[this.textureNames[i]]);
      }
      for (let i = this.textureNames.length; i < 8; i++) {
        drawable.uniforms["particleTexture" + i].setValue(1 + i).setTexture(this.textures[this.textureNames[0]]);
      }
      drawable.draw();
    },

    _setupSet: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_set.vs")
        .attach("mega_set.fs")
        .link();
      this.drawableSet = phigl.Drawable32(gl)
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
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

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

    _setupCopy: function () {
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
      this.drawableCopy = phigl.Drawable32(gl)
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

    test: function () {
      const program = phigl.Program(gl)
        .attach("mega_test.vs")
        .attach("mega_test.fs")
        .link();
      const drawable = phigl.Drawable32(gl)
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
    },

  });

});
