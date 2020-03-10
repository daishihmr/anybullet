attribute vec2 position;
attribute vec2 uv;

uniform float instanceActive;
uniform vec3 instancePosition;
uniform vec2 instanceSize;
uniform float instanceBrightness;
uniform vec2 cameraMatrix0;
uniform vec2 cameraMatrix1;
uniform vec2 cameraMatrix2;
uniform vec2 screenSize;

varying vec3 vPosition;
varying vec2 vUv;

void main(void) {
  if (instanceActive == 0.0) {
    vUv = uv;
    gl_Position = vec4(0.0);
  } else {
    vUv = uv;

    mat3 cameraMatrix = mat3(
      vec3(cameraMatrix0, 0.0),
      vec3(cameraMatrix1, 0.0),
      vec3(cameraMatrix2, 1.0)
    );

    mat3 m = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      instancePosition.xy, 1.0
    ) * mat3(
      instanceSize.x, 0.0, 0.0,
      0.0, instanceSize.y, 0.0,
      0.0, 0.0, 1.0
    );

    // ワールド座標
    vec3 worldPosition = cameraMatrix * m * vec3(position, 1.0);
    vPosition = worldPosition;

    // スクリーン座標
    vec3 screenPosition = (worldPosition + vec3(screenSize.x * -0.5, screenSize.y * -0.5, 0.0)) * vec3(1.0 / (screenSize.x * 0.5), 1.0 / (screenSize.y * -0.5), 0.0);
    screenPosition.z = instancePosition.z * -0.001;

    gl_Position = vec4(screenPosition, 1.0);
  }
}
