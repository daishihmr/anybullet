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
varying mat4 vData0;
varying mat4 vData1;

float secSize = 1.0 / texSize;

void main(void) {
  vec4 data0 = texture2D(texture, dataUv + (vec2(0.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  float lifeStart = data0[0];
  float life = data0[1];
  if (0.0 > 1.0 && lifeStart + life <= time) {
    vAlive = 0.0;
    vEmitterPosition = vec2(0.0);
    vVelocity = vec2(0.0);
    vPos = vec2(0.0);
    vData0 = mat4(0.0);
    vData1 = mat4(0.0);
    gl_Position = vec4(0.0);
    gl_PointSize = 0.0;
  } else {
    float t = (time - lifeStart) / life;

    vec4 data1 = texture2D(texture, dataUv + (vec2(1.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data2 = texture2D(texture, dataUv + (vec2(2.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data3 = texture2D(texture, dataUv + (vec2(3.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data4 = texture2D(texture, dataUv + (vec2(0.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data5 = texture2D(texture, dataUv + (vec2(1.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data6 = texture2D(texture, dataUv + (vec2(2.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data7 = texture2D(texture, dataUv + (vec2(3.0, -1.0) + vec2(0.5, -0.5)) * secSize);

    vData0 = mat4(data0, data1, data2, data3);
    vData1 = mat4(data4, data5, data6, data7);

    // float deltaSec = deltaTime * 0.001;

    // vec2 velocity = data3.yz;
    // vec2 gravity = data1.xy;
    // vec2 radialAccel = data1.zw;
    // float _tangentialAccel = data2.x;
    // vec2 emitterPosition = data6.xy;
    // vec2 pos = data0.zw;

    // velocity += gravity * deltaSec;
    // velocity += radialAccel * deltaSec;

    // if (_tangentialAccel > 0.0) {
    //   vec2 tangentialAccel = pos - emitterPosition;
    //   tangentialAccel = vec2(-tangentialAccel.y, tangentialAccel.x);
    //   normalize(tangentialAccel);
    //   tangentialAccel *= _tangentialAccel;

    //   velocity += tangentialAccel * deltaSec;
    // }

    // pos += velocity * deltaSec;

    vAlive = 1.0;
    // vEmitterPosition = emitterPosition;
    // vVelocity = velocity;
    // vPos = pos;

    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 4.0;
  }
}
