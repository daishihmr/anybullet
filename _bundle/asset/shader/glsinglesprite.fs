precision mediump float;

uniform sampler2D texture;
uniform sampler2D texture_n;
uniform sampler2D texture_e;
uniform float alphaEnabled;
uniform float brightness;
uniform float alpha;

// <include> lighting_uniform.fs

varying vec3 vPosition;
varying vec2 vUv;

// <include> lighting.fs

void main(void){
  vec4 col = texture2D(texture, vUv) * vec4(vec3(brightness), alpha);
  vec3 emi = texture2D(texture_e, vUv).xyz;
  vec3 normal = normalize(texture2D(texture_n, vUv).xyz * 2.0 - 1.0);

  vec4 result = calcLighting(vPosition, col, emi, normal);

  if (alphaEnabled > 0.0) {
    gl_FragColor = result;
  } else {
    if (result.a < 0.9) {
      discard;
    } else if (result.a < 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor = result;
    }
  }
}
