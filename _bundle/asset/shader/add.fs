precision mediump float;

uniform sampler2D srcTextureA;
uniform sampler2D srcTextureB;
uniform vec2 weight;

varying vec2 vUv;

void main(void){
  gl_FragColor = texture2D(srcTextureA, vUv) * weight.x + texture2D(srcTextureB, vUv) * weight.y;
}
