precision mediump float;

uniform sampler2D texture;

varying float vBrightness;
varying float vAlphaEnabled;
varying float vAlpha;
varying vec2 vUv;

void main(void){
  vec4 col = texture2D(texture, vUv) * vec4(vec3(vBrightness), vAlpha);
  if (vAlphaEnabled == 1.0) {
    gl_FragColor = col;
  } else {
    if (col.a < 0.1) {
      discard;
    } else {
      if (col.a < 1.0) {
        col = vec4(0.0, 0.0, 0.0, 1.0);
      }
      gl_FragColor = col;
    }
  }
}
