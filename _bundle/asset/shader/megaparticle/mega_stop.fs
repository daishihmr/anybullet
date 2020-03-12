precision mediump float;

varying vec4 vData0;
varying vec4 vData1;
varying vec4 vData2;
varying vec4 vData3;
varying vec4 vData4;
varying vec4 vData5;
varying vec4 vData6;
varying vec4 vData7;
varying vec4 vData8;

vec4 section6() {
  float loop = 0.0;

  return vec4(vData6.xyz, loop);
}

void main(void) {
  vec2 c = gl_PointCoord * 4.0;
  float stateSection = floor(c.y) * 4.0 + floor(c.x);
  if (stateSection == 0.0) {
    gl_FragColor = vData0;
  } else if (stateSection == 1.0) {
    gl_FragColor = vData1;
  } else if (stateSection == 2.0) {
    gl_FragColor = vData2;
  } else if (stateSection == 3.0) {
    gl_FragColor = vData3;
  } else if (stateSection == 4.0) {
    gl_FragColor = vData4;
  } else if (stateSection == 5.0) {
    gl_FragColor = vData5;
  } else if (stateSection == 6.0) {
    gl_FragColor = section6();
  } else if (stateSection == 7.0) {
    gl_FragColor = vData7;
  } else if (stateSection == 8.0) {
    gl_FragColor = vData8;
  } else {
    gl_FragColor = vec4(0.0);
  }
}
