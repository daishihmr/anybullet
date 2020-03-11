attribute vec2 position;
attribute vec2 dataUv;

uniform sampler2D texture;
uniform float texSize;
uniform float time;

void main(void) {
  vec4 data0 = texture2D(texture, (dataUv + vec2(0.5, 0.5)) / texSize);
  vec4 data1 = texture2D(texture, (dataUv + vec2(1.5, 0.5)) / texSize);
  vec4 data2 = texture2D(texture, (dataUv + vec2(2.5, 0.5)) / texSize);
  vec4 data3 = texture2D(texture, (dataUv + vec2(3.5, 0.5)) / texSize);
  vec4 data4 = texture2D(texture, (dataUv + vec2(0.5, 1.5)) / texSize);
  vec4 data5 = texture2D(texture, (dataUv + vec2(1.5, 1.5)) / texSize);
  vec4 data6 = texture2D(texture, (dataUv + vec2(2.5, 1.5)) / texSize);
  vec4 data7 = texture2D(texture, (dataUv + vec2(3.5, 1.5)) / texSize);

  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 4.0;
}