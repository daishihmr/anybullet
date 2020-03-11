phina.namespace(function() {

  phina.define("phina.particle2dx.EmitterGL", {
    superClass: "phina.particle2dx.Emitter",

    gl: null,
    texture: null,

    init: function(options) {
      this.superInit(options);
      this.textureName = options.textureName;
    },

    _initParticles: function(options) {
      this.oneInstanceData = [
        // instanceVisible
        0,
        // instancePosition
        0, 0,
        // instanceRotation
        0,
        // instanceScale
        1,
        // instanceColor
        0, 0, 0, 0,
      ];

      var rawArray = Array.range(0, this.maxParticles).map(function() {
        return this.oneInstanceData;
      }.bind(this)).flatten();
      this.instanceData = new Float32Array(rawArray);

      this.superMethod("_initParticles", options);
    },

    _createParticle: function(textureName, index) {
      var p = phina.particle2dx.ParticleGL(this, index);
      p.particle = this._createParticleAccessory().attachTo(p);
      return p;
    },

    setup: function(layer) {
      var gl = layer.gl;
      var ext = layer.ext;
      var vpMatrix = layer.vpMatrix;

      this.texture = phigl.Texture(gl, this.textureName);

      this.drawable = phigl.InstancedDrawable(gl, ext)
        .setProgram(this._createProgram(gl))
        .setIndexValues([0, 1, 2, 2, 1, 3])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            // 左上
            -0.5, +0.5,
            // 左下
            -0.5, -0.5,
            // 右上
            +0.5, +0.5,
            // 右下
            +0.5, -0.5,
          ]
        }, {
          unitSize: 2,
          data: [
            // 左上
            0, 1,
            // 左下
            0, 0,
            // 右上
            1, 1,
            // 右下
            1, 0,
          ],
        }])
        .declareInstanceAttributes([
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceColor",
        ])
        .declareUniforms("vpMatrix", "texture");

      return this;
    },

    render: function(layer) {
      var gl = layer.gl;
      if (this.blendFuncDestination === 1) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      } else if (this.blendFuncDestination === 771) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      }

      this.drawable.uniforms["vpMatrix"].setValue(layer.vpMatrix);
      this.drawable.uniforms["texture"].setValue(0).setTexture(this.texture);
      this.drawable.setInstanceAttributeData(this.instanceData);
      this.drawable.draw(this.maxParticles);
    },

    _createProgram: function(gl) {
      var srcV = phina.particle2dx.EmitterGL.vertexShaderSource;
      var srcF = phina.particle2dx.EmitterGL.fragmentShaderSource;

      return phigl.Program(gl)
        .attach(phigl.VertexShader().setSource(srcV))
        .attach(phigl.FragmentShader().setSource(srcF))
        .link();
    },

    _static: {

      vertexShaderSource: [
        "attribute vec2 position;",
        "attribute vec2 uv;",

        "attribute float instanceVisible;",
        "attribute vec2 instancePosition;",
        "attribute float instanceRotation;",
        "attribute float instanceScale;",
        "attribute vec4 instanceColor;",

        "uniform mat4 vpMatrix;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  vUv = uv;",
        "  vColor = instanceColor;",
        "  if (instanceVisible > 0.5) {",
        "    float s = sin(-instanceRotation);",
        "    float c = cos(-instanceRotation);",
        "    mat4 m = mat4(",
        "      vec4(c, -s, 0.0, 0.0),",
        "      vec4(s, c, 0.0, 0.0),",
        "      vec4(0.0, 0.0, 1.0, 0.0),",
        "      vec4(instancePosition, 0.0, 1.0)",
        "    ) * mat4(",
        "      vec4(instanceScale, 0.0, 0.0, 0.0),",
        "      vec4(0.0, instanceScale, 0.0, 0.0),",
        "      vec4(0.0, 0.0, 1.0, 0.0),",
        "      vec4(0.0, 0.0, 0.0, 1.0)",
        "    );",
        "    mat4 mvpMatrix = vpMatrix * m;",
        "    gl_Position = mvpMatrix * vec4(position, 0.0, 1.0);",
        "  } else {",
        "    gl_Position = vec4(0.0);",
        "  }",
        "}",
      ].join("\n"),

      fragmentShaderSource: [
        "precision mediump float;",

        "uniform sampler2D texture;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  vec4 col = texture2D(texture, vUv);",
        "  if (col.a == 0.0) discard;",
        "  gl_FragColor = col * vColor;",
        "}",
      ].join("\n"),
    }

  });

  phina.define("phina.particle2dx.ParticleGL", {
    superClass: "phina.app.Element",

    oneDataLength: 0,
    instanceData: null,
    index: 0,

    init: function(emitter, index) {
      this.superInit();
      this.oneDataLength = emitter.oneInstanceData.length;
      this.instanceData = emitter.instanceData;
      this.index = index;
    },

    _accessor: {
      visible: {
        get: function() {
          return !!this.instanceData[this.oneDataLength * this.index + 0];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 0] = v ? 1 : 0;
        },
      },
      x: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 1] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 2] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 3] = v;
        },
      },
      scale: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 4] = v;
        },
      },
      r: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 5] = v;
        },
      },
      g: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 6];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 6] = v;
        },
      },
      b: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 7] = v;
        },
      },
      a: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 8] = v;
        },
      },
    },
  });

});