precision mediump float;

uniform sampler2D particleTexture0;
uniform sampler2D particleTexture1;
uniform sampler2D particleTexture2;
uniform sampler2D particleTexture3;
uniform sampler2D particleTexture4;
uniform sampler2D particleTexture5;
uniform sampler2D particleTexture6;
uniform sampler2D particleTexture7;

varying float vActive;
varying float vTextureIndex;
varying vec2 vUv;
varying vec4 vColor;
varying float vAdditive;

void main(void) {
  if (vActive < 1.0) {
    discard;
  } else {
    vec4 texCol;
    if (vTextureIndex == 0.0) {
      texCol = texture2D(particleTexture0, vUv);
    } else if (vTextureIndex == 1.0) {
      texCol = texture2D(particleTexture1, vUv);
    } else if (vTextureIndex == 2.0) {
      texCol = texture2D(particleTexture2, vUv);
    } else if (vTextureIndex == 3.0) {
      texCol = texture2D(particleTexture3, vUv);
    } else if (vTextureIndex == 4.0) {
      texCol = texture2D(particleTexture4, vUv);
    } else if (vTextureIndex == 5.0) {
      texCol = texture2D(particleTexture5, vUv);
    } else if (vTextureIndex == 6.0) {
      texCol = texture2D(particleTexture6, vUv);
    } else if (vTextureIndex == 7.0) {
      texCol = texture2D(particleTexture7, vUv);
    } else {
      discard;
    }
    gl_FragColor = texCol * vColor;
    gl_FragColor.a *= 1.0 - vAdditive;
  }
}
