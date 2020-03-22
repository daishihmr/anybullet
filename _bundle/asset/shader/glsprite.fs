precision mediump float;

uniform sampler2D texture;
uniform float alphaEnabled;

// <include> lighting_uniform.fs

varying vec4 v0;
varying vec4 v1;
varying float vAlpha;
varying vec3 vColor;

// <include> lighting.fs

void main(void){
  vec2 vUv = v0.zw;
  vec2 vUvN = v1.xy;
  vec2 vUvE = v1.zw;

  vec4 col = texture2D(texture, vUv);
  col *= vec4(vColor, vAlpha);
  vec3 emi = texture2D(texture, vUvE).xyz;
  vec3 normal = normalize(texture2D(texture, vUvN).xyz * 2.0 - 1.0);

  vec4 result = calcLighting(vec3(v0.xy, 0.0), col, emi, normal);
  result.rgb *= result.a;

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
