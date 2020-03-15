attribute vec2 position;
attribute vec2 uv;
attribute vec2 dataUv;

uniform sampler2D texture;
uniform float texSize;
uniform float time;
uniform vec2 screenSize;

varying float vActive;
varying float vTextureIndex;
varying vec2 vUv;
varying vec4 vColor;
varying float vAdditive;

float secSize = 1.0 / texSize;

void main(void) {
  vec4 data0 = texture2D(texture, dataUv + (vec2(0.0, 0.0) + vec2(0.5, -0.5)) * secSize);
  vec4 data7 = texture2D(texture, dataUv + (vec2(3.0, -1.0) + vec2(0.5, -0.5)) * secSize);

  float emitterStartTime = data0[0];
  float life = data0[1];
  float emitInterval = data7[0];
  float indexInEmitter = data7[1];

  float lifeFrom = emitterStartTime + emitInterval * indexInEmitter;
  float lifeTo = lifeFrom + life;

  if (time < lifeFrom || lifeTo <= time) {
    vActive = 0.0;
    vTextureIndex = 0.0;
    vUv = vec2(0.0);
    vColor = vec4(0.0);
    vAdditive = 0.0;
    gl_Position = vec4(0.0);
  } else {
    vActive = 1.0;
    float t = (time - lifeFrom) / life;

    vec4 data2 = texture2D(texture, dataUv + (vec2(2.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data3 = texture2D(texture, dataUv + (vec2(3.0, 0.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data4 = texture2D(texture, dataUv + (vec2(0.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data5 = texture2D(texture, dataUv + (vec2(1.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data6 = texture2D(texture, dataUv + (vec2(2.0, -1.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data8 = texture2D(texture, dataUv + (vec2(0.0, -2.0) + vec2(0.5, -0.5)) * secSize);
    vec4 data9 = texture2D(texture, dataUv + (vec2(1.0, -2.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data10 = texture2D(texture, dataUv + (vec2(2.0, -2.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data11 = texture2D(texture, dataUv + (vec2(3.0, -2.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data12 = texture2D(texture, dataUv + (vec2(0.0, -3.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data13 = texture2D(texture, dataUv + (vec2(1.0, -3.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data14 = texture2D(texture, dataUv + (vec2(2.0, -3.0) + vec2(0.5, -0.5)) * secSize);
    // vec4 data15 = texture2D(texture, dataUv + (vec2(3.0, -3.0) + vec2(0.5, -0.5)) * secSize);

    vec2 pos = data0.zw;
    float scale = mix(data2[1], data2[2], t);
    float rotation = mix(data2[3], data3[0], t);
    vec4 color = mix(data4, data5, t);
    float z = data9[2];

    float s = sin(-rotation);
    float c = cos(-rotation);

    mat3 matT = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      pos.x, pos.y, 1.0
    );
    mat3 matR = mat3(
      c, -s, 0.0,
      s, c, 0.0,
      pos.x, pos.y, 1.0
    );
    mat3 matS = mat3(
      scale, 0.0, 0.0,
      0.0, scale, 0.0,
      0.0, 0.0, 1.0
    );

    vec3 worldPosition = matR * matS * vec3(position, 1.0);
    vec3 screenPosition = (worldPosition + vec3(-screenSize.x * 0.5, -screenSize.y * 0.5, 0.0)) * vec3(1.0 / (screenSize.x * 0.5), -1.0 / (screenSize.y * 0.5), 0.0);
    screenPosition.z = z * -0.001;

    vTextureIndex = floor(data3[3]);
    vUv = uv;
    vColor = color;
    vAdditive = data6[2];
    gl_Position = vec4(screenPosition.xyz, 1.0);
  }
}