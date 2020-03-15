precision mediump float;

varying float vEmitterStartTime;
varying vec2 vEmitterPosition;
varying vec2 vVelocity;
varying vec2 vPos;
varying vec2 vBasePosition;
varying vec2 vRadialAccel;
varying float vEmitterPositionZ;
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
// varying vec4 vData10;
// varying vec4 vData11;
// varying vec4 vData12;
// varying vec4 vData13;
// varying vec4 vData14;
// varying vec4 vData15;

vec4 section0() {
  vec4 d = vData0;
  d[0] = vEmitterStartTime;
  d[2] = vPos.x;
  d[3] = vPos.y;
  return d;
}

vec4 section1() {
  vec4 d = vData1;
  d[2] = vRadialAccel.x;
  d[3] = vRadialAccel.y;
  return d;
}

vec4 section2() {
  vec4 d = vData2;
  return d;
}

vec4 section3() {
  vec4 d = vData3;
  return d;
}

vec4 section4() {
  vec4 d = vData4;
  return d;
}

vec4 section5() {
  vec4 d = vData5;
  return d;
}

vec4 section6() {
  vec4 d = vData6;
  d[0] = vEmitterPosition.x;
  d[1] = vEmitterPosition.y;
  return d;
}

vec4 section7() {
  vec4 d = vData7;
  d[2] = vBasePosition.x;
  d[3] = vBasePosition.y;
  return d;
}

vec4 section8() {
  vec4 d = vData8;
  d[0] = vVelocity.x;
  d[1] = vVelocity.y;
  return d;
}

vec4 section9() {
  vec4 d = vData9;
  d[2] = vEmitterPositionZ;
  return d;
}

// vec4 section10() {
//   vec4 d = vData10;
//   return d;
// }

// vec4 section11() {
//   vec4 d = vData11;
//   return d;
// }

// vec4 section12() {
//   vec4 d = vData12;
//   return d;
// }

// vec4 section13() {
//   vec4 d = vData13;
//   return d;
// }

// vec4 section14() {
//   vec4 d = vData14;
//   return d;
// }

// vec4 section15() {
//   vec4 d = vData15;
//   return d;
// }

void main(void) {
  vec2 c = gl_PointCoord * 4.0;
  float stateSection = floor(c.y) * 4.0 + floor(c.x);
  if (stateSection == 0.0) {
    gl_FragColor = section0();
  } else if (stateSection == 1.0) {
    gl_FragColor = section1();
  } else if (stateSection == 2.0) {
    gl_FragColor = section2();
  } else if (stateSection == 3.0) {
    gl_FragColor = section3();
  } else if (stateSection == 4.0) {
    gl_FragColor = section4();
  } else if (stateSection == 5.0) {
    gl_FragColor = section5();
  } else if (stateSection == 6.0) {
    gl_FragColor = section6();
  } else if (stateSection == 7.0) {
    gl_FragColor = section7();
  } else if (stateSection == 8.0) {
    gl_FragColor = section8();
  } else if (stateSection == 9.0) {
    gl_FragColor = section9();
  // } else if (stateSection == 10.0) {
  //   gl_FragColor = section10();
  // } else if (stateSection == 11.0) {
  //   gl_FragColor = section11();
  // } else if (stateSection == 12.0) {
  //   gl_FragColor = section12();
  // } else if (stateSection == 13.0) {
  //   gl_FragColor = section13();
  // } else if (stateSection == 14.0) {
  //   gl_FragColor = section14();
  // } else if (stateSection == 15.0) {
  //   gl_FragColor = section15();
  } else {
    discard;
  }
}

