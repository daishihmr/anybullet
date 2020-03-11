precision mediump float;

uniform vec4 section0;
uniform vec4 section1;
uniform vec4 section2;
uniform vec4 section3;
uniform vec4 section4;
uniform vec4 section5;
uniform vec4 section6;
uniform vec4 section7;
uniform vec4 section8;
uniform vec4 section9;
uniform vec4 section10;
uniform vec4 section11;
uniform vec4 section12;
uniform vec4 section13;
uniform vec4 section14;
uniform vec4 section15;

void main(void) {
  vec2 c = gl_PointCoord * 4.0;
  float stateSection = floor(c.y) * 4.0 + floor(c.x);
  if (stateSection == 0.0) {
    gl_FragColor = section0;
  } else if (stateSection == 1.0) {
    gl_FragColor = section1;
  } else if (stateSection == 2.0) {
    gl_FragColor = section2;
  } else if (stateSection == 3.0) {
    gl_FragColor = section3;
  } else if (stateSection == 4.0) {
    gl_FragColor = section4;
  } else if (stateSection == 5.0) {
    gl_FragColor = section5;
  } else if (stateSection == 6.0) {
    gl_FragColor = section6;
  } else if (stateSection == 7.0) {
    gl_FragColor = section7;
  } else if (stateSection == 8.0) {
    gl_FragColor = section8;
  } else if (stateSection == 9.0) {
    gl_FragColor = section9;
  } else if (stateSection == 10.0) {
    gl_FragColor = section10;
  } else if (stateSection == 11.0) {
    gl_FragColor = section11;
  } else if (stateSection == 12.0) {
    gl_FragColor = section12;
  } else if (stateSection == 13.0) {
    gl_FragColor = section13;
  } else if (stateSection == 14.0) {
    gl_FragColor = section14;
  } else if (stateSection == 15.0) {
    gl_FragColor = section15;
  } else {
    gl_FragColor = vec4(0.0);
  }
}

