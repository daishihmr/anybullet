precision mediump float;

varying float vAlive;
varying vec2 vEmitterPosition;
varying vec2 vVelocity;
varying vec2 vPos;
varying mat4 vData0;
varying mat4 vData1;

vec4 section0() {
  vec4 d = vData0[0];
  // d[2] = vPos.x;
  // d[3] = vPos.y;
  return d;
}

vec4 section1() {
  vec4 d = vData0[1];
  return d;
}

vec4 section2() {
  vec4 d = vData0[2];
  return d;
}

vec4 section3() {
  vec4 d = vData0[3];
  // d[1] = vVelocity.x;
  // d[2] = vVelocity.y;
  return d;
}

vec4 section4() {
  vec4 d = vData1[0];
  return d;
}

vec4 section5() {
  vec4 d = vData1[1];
  return d;
}

vec4 section6() {
  vec4 d = vData1[2];
  // d[0] = vEmitterPosition.x;
  // d[1] = vEmitterPosition.y;
  return d;
}

void main(void) {
  if (vAlive > 0.0) {
    gl_FragColor = vec4(0.0);
  } else {
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
    } else {
      gl_FragColor = vec4(0.0);
    }
  }
}

