attribute vec2 position;
attribute vec2 dataUv;

uniform sampler2D texture;
uniform float texSize;
uniform float time;
uniform float deltaTime;
uniform vec2 deltaPosition; // 全体の移動量

// エミッター単位の移動
uniform float moveEmitterIndex[8];
uniform vec3 moveEmitterPosition[8];

varying float vEmitterStartTime;
varying vec2 vEmitterPosition;
varying vec2 vVelocity;
varying vec2 vPos;
varying vec2 vBasePosition;
varying vec2 vRadialAccel;
varying float vEmitterPositionZ;
varying vec4 vData0;
varying vec4 vData1;
varying vec4 vData2;
varying vec4 vData3;
varying vec4 vData4;
varying vec4 vData5;
varying vec4 vData6;
varying vec4 vData7;
varying vec4 vData8;
varying vec4 vData9;
// varying vec4 vData10;
// varying vec4 vData11;
// varying vec4 vData12;
// varying vec4 vData13;
// varying vec4 vData14;
// varying vec4 vData15;

float secSize = 1.0 / texSize;
float PI = 3.141592653589793;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main(void) {
  vData0 = texture2D(texture, dataUv + (vec2(0.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  vData1 = texture2D(texture, dataUv + (vec2(1.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  vData2 = texture2D(texture, dataUv + (vec2(2.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  vData3 = texture2D(texture, dataUv + (vec2(3.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  vData4 = texture2D(texture, dataUv + (vec2(0.0, -1.0) + vec2(0.5, -0.5)) * secSize);
  vData5 = texture2D(texture, dataUv + (vec2(1.0, -1.0) + vec2(0.5, -0.5)) * secSize);
  vData6 = texture2D(texture, dataUv + (vec2(2.0, -1.0) + vec2(0.5, -0.5)) * secSize);
  vData7 = texture2D(texture, dataUv + (vec2(3.0, -1.0) + vec2(0.5, -0.5)) * secSize);
  vData8 = texture2D(texture, dataUv + (vec2(0.0, -2.0) + vec2(0.5, -0.5)) * secSize);
  vData9 = texture2D(texture, dataUv + (vec2(1.0, -2.0) + vec2(0.5, -0.5)) * secSize);
  // vData10 = texture2D(texture, dataUv + (vec2(2.0, -2.0) + vec2(0.5, -0.5)) * secSize);
  // vData11 = texture2D(texture, dataUv + (vec2(3.0, -2.0) + vec2(0.5, -0.5)) * secSize);
  // vData12 = texture2D(texture, dataUv + (vec2(0.0, -3.0) + vec2(0.5, -0.5)) * secSize);
  // vData13 = texture2D(texture, dataUv + (vec2(1.0, -3.0) + vec2(0.5, -0.5)) * secSize);
  // vData14 = texture2D(texture, dataUv + (vec2(2.0, -3.0) + vec2(0.5, -0.5)) * secSize);
  // vData15 = texture2D(texture, dataUv + (vec2(3.0, -3.0) + vec2(0.5, -0.5)) * secSize);

  vEmitterStartTime = vData0[0];
  vEmitterPosition = vData6.xy;
  vVelocity = vData8.xy;
  vPos = vData0.zw;
  vBasePosition = vData7.zw;
  vRadialAccel = vData1.zw;

  float life = vData0[1];
  float loop = vData6[3];
  float emitInterval = vData7[0];
  float indexInEmitter = vData7[1];
  vec2 baseVelocity = vData8.zw;
  float emitterIndex = vData9[0];
  float radialAccelScalar = vData9[1];

  float lifeFrom = vEmitterStartTime + emitInterval * indexInEmitter;
  float lifeTo = lifeFrom + life;

  if (time < lifeFrom) { // TODO なんか実装がヤバイけどとりあえずいいや
    // update emitter position
    for (int i = 0; i < 8; i++) {
      if (moveEmitterIndex[i] == emitterIndex) {
        vEmitterPosition = moveEmitterPosition[i].xy;
        vEmitterPositionZ = moveEmitterPosition[i].z;
      }
    }
    // reset position
    vPos = vEmitterPosition + vBasePosition;
    // reset radialAccel
    vRadialAccel = vPos - vEmitterPosition;
    if (length(vRadialAccel) == 0.0) {
      float x = random(vEmitterPosition) * 2.0 - 1.0;
      float y = random(vVelocity) * 2.0 - 1.0;
      vRadialAccel = vec2(x, y);
    }
    vRadialAccel = normalize(vRadialAccel) * radialAccelScalar;
    // reset velocity
    vVelocity = baseVelocity;
  } else if (loop > 0.0 && lifeTo <= time) {
    // update emitter position
    for (int i = 0; i < 8; i++) {
      if (moveEmitterIndex[i] == emitterIndex) {
        vEmitterPosition = moveEmitterPosition[i].xy;
        vEmitterPositionZ = moveEmitterPosition[i].z;
      }
    }
    // reset position
    vPos = vEmitterPosition + vBasePosition;
    // reset radialAccel
    vRadialAccel = vPos - vEmitterPosition;
    if (length(vRadialAccel) == 0.0) {
      float x = random(vEmitterPosition) * 2.0 - 1.0;
      float y = random(vVelocity) * 2.0 - 1.0;
      vRadialAccel = vec2(x, y);
    }
    vRadialAccel = normalize(vRadialAccel) * radialAccelScalar;
    // reset velocity
    vVelocity = baseVelocity;
    // reset emitterStartTime
    vEmitterStartTime = time - emitInterval * indexInEmitter;
  } else if (lifeFrom <= time && time < lifeTo) {
    // update velocity
    vec2 gravity = vData1.xy;
    float _tangentialAccel = vData2.x;
    vVelocity += gravity * deltaTime;
    vVelocity += vRadialAccel * deltaTime;
    if (distance(vPos, vEmitterPosition) > 0.0 && abs(_tangentialAccel) > 0.0) {
      vec2 v = vPos - vEmitterPosition;
      vec2 tangentialAccel = normalize(v.yx * vec2(-1.0, 1.0)) * _tangentialAccel;
      vVelocity += tangentialAccel * deltaTime;
    }

    // update position
    vPos += vVelocity * deltaTime;
  }

  vPos += deltaPosition;
  vBasePosition += deltaPosition;
  vEmitterPosition += deltaPosition;

  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 4.0;
}
