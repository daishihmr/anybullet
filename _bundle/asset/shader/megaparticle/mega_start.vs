attribute float index;

uniform float texSize;

varying float vIndex;
varying vec2 vPosition;

void main(void) {
  vIndex = index;
  float secSize = texSize / 4.0;
  float x = mod(index, secSize);
  float y = floor(index / secSize);
  vec2 position = vec2((-texSize / 2.0 + (x * 4.0 + 2.0)) / (texSize / 2.0), (texSize / 2.0 - (y * 4.0 + 2.0)) / (texSize / 2.0));
  vPosition = position;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 4.0;
}