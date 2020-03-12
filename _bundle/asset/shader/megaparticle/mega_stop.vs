attribute vec2 position;
attribute vec2 dataUv;

uniform sampler2D texture;
uniform float texSize;

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

  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 4.0;
}