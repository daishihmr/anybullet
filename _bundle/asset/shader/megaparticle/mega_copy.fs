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
varying vec4 vData9;
varying vec4 vData10;
varying vec4 vData11;
varying vec4 vData12;
varying vec4 vData13;
varying vec4 vData14;
varying vec4 vData15;

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
    gl_FragColor = vData6;
  } else if (stateSection == 7.0) {
    gl_FragColor = vData7;
  } else if (stateSection == 8.0) {
    gl_FragColor = vData8;
  } else if (stateSection == 9.0) {
    gl_FragColor = vData9;
  } else if (stateSection == 10.0) {
    gl_FragColor = vData10;
  } else if (stateSection == 11.0) {
    gl_FragColor = vData11;
  } else if (stateSection == 12.0) {
    gl_FragColor = vData12;
  } else if (stateSection == 13.0) {
    gl_FragColor = vData13;
  } else if (stateSection == 14.0) {
    gl_FragColor = vData14;
  } else if (stateSection == 15.0) {
    gl_FragColor = vData15;
  } else {
    gl_FragColor = vec4(0.0);
  }
}
