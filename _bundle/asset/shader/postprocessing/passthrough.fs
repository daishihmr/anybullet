precision mediump float;

uniform sampler2D srcTexture;

varying vec2 vUv;

void main(void) {
  gl_FragColor = texture2D(srcTexture, vUv);
}