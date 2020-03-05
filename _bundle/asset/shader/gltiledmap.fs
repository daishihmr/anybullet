precision mediump float;

uniform sampler2D texture[8];
uniform sampler2D texture_n[8];

// <include> lighting_uniform.fs

varying vec3 vPosition;
varying float vTextureIndex;
varying float vBrightness;
varying float vAlphaEnabled;
varying float vAlpha;
varying vec2 vUv;

// <include> lighting.fs

void main(void){
  vec4 col;
  vec3 normal;
  if (vTextureIndex == 0.0) {
    col = texture2D(texture[0], vUv);
    normal = texture2D(texture_n[0], vUv).xyz;
  } else if (vTextureIndex == 1.0) {
    col = texture2D(texture[1], vUv);
    normal = texture2D(texture_n[1], vUv).xyz;
  } else if (vTextureIndex == 2.0) {
    col = texture2D(texture[2], vUv);
    normal = texture2D(texture_n[2], vUv).xyz;
  } else if (vTextureIndex == 3.0) {
    col = texture2D(texture[3], vUv);
    normal = texture2D(texture_n[3], vUv).xyz;
  } else if (vTextureIndex == 4.0) {
    col = texture2D(texture[4], vUv);
    normal = texture2D(texture_n[4], vUv).xyz;
  } else if (vTextureIndex == 5.0) {
    col = texture2D(texture[5], vUv);
    normal = texture2D(texture_n[5], vUv).xyz;
  } else if (vTextureIndex == 6.0) {
    col = texture2D(texture[6], vUv);
    normal = texture2D(texture_n[6], vUv).xyz;
  } else if (vTextureIndex == 7.0) {
    col = texture2D(texture[7], vUv);
    normal = texture2D(texture_n[7], vUv).xyz;
  } else {
    discard;
  }

  col *= vec4(vec3(vBrightness), vAlpha);

  vec4 result = calcLighting(vPosition, col, vec3(0.0), normal);

  if (vAlphaEnabled == 1.0) {
    gl_FragColor = result;
  } else {
    if (result.a < 0.1) {
      discard;
    } else {
      if (result.a < 1.0) {
        result = vec4(0.0, 0.0, 0.0, 1.0);
      }
      gl_FragColor = result;
    }
  }
}
