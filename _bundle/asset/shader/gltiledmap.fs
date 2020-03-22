precision mediump float;

uniform sampler2D texture[4];
uniform sampler2D texture_n[4];
uniform sampler2D texture_e[4];

// <include> lighting_uniform.fs

varying vec3 vPosition;
varying float vTextureIndex;
varying float vAlpha;
varying vec2 vUv;

// <include> lighting.fs

void main(void){
  vec4 col;
  vec3 normal;
  vec3 emi;
  if (vTextureIndex == 0.0) {
    col = texture2D(texture[0], vUv);
    normal = texture2D(texture_n[0], vUv).xyz;
    emi = texture2D(texture_e[0], vUv).xyz;
  } else if (vTextureIndex == 1.0) {
    col = texture2D(texture[1], vUv);
    normal = texture2D(texture_n[1], vUv).xyz;
    emi = texture2D(texture_e[1], vUv).xyz;
  } else if (vTextureIndex == 2.0) {
    col = texture2D(texture[2], vUv);
    normal = texture2D(texture_n[2], vUv).xyz;
    emi = texture2D(texture_e[2], vUv).xyz;
  } else if (vTextureIndex == 3.0) {
    col = texture2D(texture[3], vUv);
    normal = texture2D(texture_n[3], vUv).xyz;
    emi = texture2D(texture_e[3], vUv).xyz;
  } else {
    discard;
  }

  vec4 result = calcLighting(vPosition, col, emi, normal);
  // result.rgb *= result.a;

  if (result.a < 1.0) {
    discard;
  } else {
    gl_FragColor = result;
  }
}
