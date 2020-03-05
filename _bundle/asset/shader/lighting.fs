vec4 calcLighting(vec3 pos, vec4 col, vec3 emi, vec3 normal) {
  vec4 result = col * ambientColor + vec4(emi, 0.0);
  
  for (int i = 0; i < 10; i++) {
    if (lightPower[i] == 0.0) continue;
    vec3 lightDirection = normalize(lightPosition[i] - pos);
    float angle = clamp(dot(normal, lightDirection), 0.0, 1.0);
    float dist = distance(pos, lightPosition[i]);

    vec4 diffuse = col * lightColor[i] * angle * lightPower[i] / (dist * dist);
    result += diffuse;
  }

  return result;
}
