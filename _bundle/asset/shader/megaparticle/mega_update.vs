attribute vec2 position;
attribute vec2 dataUv;

uniform sampler2D texture;
uniform float texSize;
uniform float time;
uniform float deltaTime;

varying float vAlive;
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

float secSize = 1.0 / texSize;

void main(void) {
  vData0 = texture2D(texture, dataUv + (vec2(0.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  float lifeStart = vData0[0];
  float life = vData0[1];
  if (time < lifeStart || lifeStart + life <= time) {
    vAlive = 0.0;
    vEmitterPosition = vec2(0.0);
    vVelocity = vec2(0.0);
    vPos = vec2(0.0);
    vData1 = vec4(0.0);
    vData2 = vec4(0.0);
    vData3 = vec4(0.0);
    vData4 = vec4(0.0);
    vData5 = vec4(0.0);
    vData6 = vec4(0.0);
    gl_Position = vec4(0.0);
    gl_PointSize = 0.0;
  } else {
    vAlive = 1.0;

    float t = clamp((time - lifeStart) / life, 0.0, 1.0);

    vData1 = texture2D(texture, dataUv + (vec2(1.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vData2 = texture2D(texture, dataUv + (vec2(2.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vData3 = texture2D(texture, dataUv + (vec2(3.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vData4 = texture2D(texture, dataUv + (vec2(0.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vData5 = texture2D(texture, dataUv + (vec2(1.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vData6 = texture2D(texture, dataUv + (vec2(2.0, -1.0) + vec2(0.5, -0.5)) * secSize);

    vec2 velocity = vData3.yz;
    vec2 gravity = vData1.xy;
    vec2 radialAccel = vData1.zw;
    float _tangentialAccel = vData2.x;
    vec2 emitterPosition = vData6.xy;
    vec2 pos = vData0.zw;

    velocity += gravity * deltaTime;
    velocity += radialAccel * deltaTime;

    if (_tangentialAccel > 0.0) {
      vec2 tangentialAccel = pos - emitterPosition;
      tangentialAccel = tangentialAccel.yx * vec2(-1.0, 1.0);
      tangentialAccel = normalize(tangentialAccel);
      tangentialAccel *= _tangentialAccel;

      velocity += tangentialAccel * deltaTime;
    }

    pos += velocity * deltaTime;

    vEmitterPosition = emitterPosition;
    vVelocity = velocity;
    vPos = pos;

    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 4.0;
  }
}
