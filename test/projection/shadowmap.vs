attribute vec2 position;

uniform vec2 eye;
uniform float far;

float PI = 3.141592653589793;

void main(void) {
  vec2 v = position - eye;
  float dist = (v.length() / far) * 2.0 - 1.0;
  float angle = (v.x == 0.0 ? sign(v.y) * PI / 2 : atan(v.y, v.x)) / PI;

  gl_Position = vec4(dist, angle, 0.0, 1.0);
}