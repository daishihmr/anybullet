attribute vec2 position;
attribute vec2 dataUv;

uniform sampler2D texture;
uniform float texSize;
uniform float time;
uniform float deltaTime;

varying float vEmitterStartTime;
varying vec2 vEmitterPosition;
varying vec2 vVelocity;
varying vec2 vPos;
varying vec4 vData0;
varying vec4 vData1;
varying vec4 vData2;
varying vec4 vData3;
varying vec4 vData4;
varying vec4 vData5;
varying vec4 vData6;
varying vec4 vData7;
varying vec4 vData8;

float secSize = 1.0 / texSize;

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
  vEmitterStartTime = vData0[0];
  vEmitterPosition = vData6.xy;
  vVelocity = vData3.yz;
  vPos = vData0.zw;

  float life = vData0[1];
  float loop = vData6[3];
  float emitInterval = vData7[0];
  float indexInEmitter = vData7[1];
  vec2 basePosition = vData7.zw;
  vec2 baseVelocity = vData8.xy;

  float lifeFrom = vEmitterStartTime + emitInterval * indexInEmitter;
  float lifeTo = lifeFrom + life;

  if (loop > 0.0 && lifeTo <= time) {
    // reset emitterStartTime
    vEmitterStartTime = time - emitInterval * indexInEmitter;
    // reset velocity
    vVelocity = baseVelocity;
    // reset position
    vPos = basePosition;
  } else if (lifeFrom <= time && time < lifeTo) {
    vec2 gravity = vData1.xy;
    vec2 radialAccel = vData1.zw;
    float _tangentialAccel = vData2.x;

    // update velocity
    vVelocity += gravity * deltaTime;
    vVelocity += radialAccel * deltaTime;
    if (_tangentialAccel > 0.0) {
      vec2 tangentialAccel = vPos - vEmitterPosition;
      tangentialAccel = tangentialAccel.yx * vec2(-1.0, 1.0);
      tangentialAccel = normalize(tangentialAccel);
      tangentialAccel *= _tangentialAccel;

      vVelocity += tangentialAccel * deltaTime;
    }

    // update position
    vPos += vVelocity * deltaTime;
  }

  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 4.0;
}
