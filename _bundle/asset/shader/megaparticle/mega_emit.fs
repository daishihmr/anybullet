precision mediump float;

uniform float time;
uniform mat4 data0;
uniform mat4 data1;
uniform mat4 data2;

vec2 randomFactor = vec2(0.0);

float random(vec2 st) {
  randomFactor += vec2(time * 3.0, time * 2.0);
  return fract(sin(dot(st + randomFactor, vec2(12.9898, 78.233))) * 43758.5453123);
}

float variance(float base, float variance) {
  return mix(base - variance, base + variance, random(gl_FragCoord.xy));
}

vec2 spawnPosition(float emitterX, float emitterY, float varianceX, float varianceY) {
  return vec2(
    mix(emitterX - varianceX, emitterX + varianceX, random(gl_FragCoord.xy)),
    mix(emitterY - varianceY, emitterY + varianceY, random(gl_FragCoord.xy))
  );
}

vec4 section0() {
  float particleLifespan = data2[1][2];
  float particleLifespanVariance = data2[1][3];
  float emitterPositionX = data0[0][0];
  float emitterPositionY = data0[0][1];
  float sourcePositionVariancex = data0[0][2];
  float sourcePositionVariancey = data0[0][3];

  float lifeStart = time;
  float life = variance(particleLifespan, particleLifespanVariance);
  vec2 pos = spawnPosition(emitterPositionX, emitterPositionY, sourcePositionVariancex, sourcePositionVariancey);

  return vec4(lifeStart, life, pos.x, pos.y);
}

vec4 section1() {
  float gravityX = data2[0][0];
  float gravityY = data2[0][1];
  float radialAcceleration = data2[0][2];
  float radialAccelVariance = data2[0][3];
  float emitterPositionX = data0[0][0];
  float emitterPositionY = data0[0][1];
  float sourcePositionVariancex = data0[0][2];
  float sourcePositionVariancey = data0[0][3];

  vec2 pos = spawnPosition(emitterPositionX, emitterPositionY, sourcePositionVariancex, sourcePositionVariancey);
  vec2 radialAccel = vec2(pos.x - emitterPositionY, pos.y - emitterPositionY);
  normalize(radialAccel);
  radialAccel *= variance(radialAcceleration, radialAccelVariance);

  return vec4(gravityX, gravityY, radialAccel.x, radialAccel.y);
}

vec4 section2() {
  float tangentialAcceleration = data2[0][2];
  float tangentialAccelVariance = data2[0][3];
  float startParticleSize = data0[1][0];
  float startParticleSizeVariance = data0[1][1];
  float finishParticleSize = data0[1][2];
  float finishParticleSizeVariance = data0[1][3];
  float rotationStart = data0[2][0];
  float rotationStartVariance = data0[2][1];

  float tangentialAccel = variance(tangentialAcceleration, tangentialAccelVariance);
  float scaleFrom = variance(startParticleSize, startParticleSizeVariance);
  float scaleTo = variance(finishParticleSize, finishParticleSizeVariance);
  float rotationFrom = variance(rotationStart, rotationStartVariance);

  return vec4(tangentialAccel, scaleFrom, scaleTo, rotationFrom);
}

vec4 section3() {
  float rotationEnd = data0[2][2];
  float rotationEndVariance = data0[2][3];
  float angle = data1[3][0];
  float angleVariance = data1[3][1];
  float speed = data1[3][2];
  float speedVariance = data1[3][3];
  float textureIndex = data2[2][0];

  float rotationTo = variance(rotationEnd, rotationEndVariance);
  float _angle = radians(variance(angle, angleVariance));
  float _speed = variance(speed, speedVariance);
  vec2 velocity = vec2(cos(_angle) * _speed, sin(_angle) * _speed);

  return vec4(rotationTo, velocity.x, velocity.y, textureIndex);
}

vec4 section4() {
  float startColorRed = data0[3][0];
  float startColorVarianceRed = data0[3][1];
  float startColorGreen = data1[0][0];
  float startColorVarianceGreen = data1[0][1];
  float startColorBlue = data1[1][0];
  float startColorVarianceBlue = data1[1][1];
  float startColorAlpha = data1[2][0];
  float startColorVarianceAlpha = data1[2][1];

  float rFrom = variance(startColorRed, startColorVarianceRed);
  float gFrom = variance(startColorGreen, startColorVarianceGreen);
  float bFrom = variance(startColorBlue, startColorVarianceBlue);
  float aFrom = variance(startColorAlpha, startColorVarianceAlpha);

  return vec4(rFrom, gFrom, bFrom, aFrom);
}

vec4 section5() {
  float finishColorRed = data0[3][2];
  float finishColorVarianceRed = data0[3][3];
  float finishColorGreen = data1[0][2];
  float finishColorVarianceGreen = data1[0][3];
  float finishColorBlue = data1[1][2];
  float finishColorVarianceBlue = data1[1][3];
  float finishColorAlpha = data1[2][2];
  float finishColorVarianceAlpha = data1[2][3];

  float rTo = variance(finishColorRed, finishColorVarianceRed);
  float gTo = variance(finishColorGreen, finishColorVarianceGreen);
  float bTo = variance(finishColorBlue, finishColorVarianceBlue);
  float aTo = variance(finishColorAlpha, finishColorVarianceAlpha);

  return vec4(rTo, gTo, bTo, aTo);
}

void main(void) {
  vec2 c = gl_PointCoord * 4.0 - vec2(0.5);
  float stateSection = floor(c.y * 4.0 + c.x);
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
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}

