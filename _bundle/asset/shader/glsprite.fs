precision mediump float;

uniform sampler2D texture;

// <include> lighting_uniform.fs

varying vec4 v0;
varying vec4 v1;

// <include> lighting.fs

void main(void){
  vec2 vUv = v0.zw;
  vec2 vUvN = v1.xy;
  vec2 vUvE = v1.zw;

  vec4 col = texture2D(texture, vUv);
  vec3 emi = texture2D(texture, vUvE).xyz;
  vec3 normal = normalize(texture2D(texture, vUvN).xyz * 2.0 - 1.0);

  vec4 result = calcLighting(vec3(v0.xy, 0.0), col, emi, normal);
  result = vec4(floor(result.rgb * 5.0) / 5.0, result.a);

  if (result.a == 0.0) {
    discard;
  } else if (result.a < 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = result;
  }
}
