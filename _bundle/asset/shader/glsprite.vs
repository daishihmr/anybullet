attribute vec2 posuv;

attribute vec3 instanceUvMatrix0;
attribute vec3 instanceUvMatrix1;
attribute vec3 instanceUvMatrixN0;
attribute vec3 instanceUvMatrixN1;
attribute vec3 instanceUvMatrixE0;
attribute vec3 instanceUvMatrixE1;
attribute vec3 instancePosition;
attribute vec4 instanceSize;
attribute vec3 cameraMatrix0;
attribute vec3 cameraMatrix1;
attribute vec3 color;

uniform vec2 screenSize;

varying vec4 v0; // vec2 position + vec2 uv
varying vec4 v1; // vec2 uvn + vec2 uve
varying float vAlpha;
varying vec3 vColor;

void main(void) {
  float instanceActive = instanceSize.z;
  if (instanceActive == 0.0) {
    v0 = vec4(0.0);
    v1 = vec4(0.0);
    vAlpha = 0.0;
    vColor = vec3(0.0);
    gl_Position = vec4(0.0);
  } else {
    mat3 uvm = mat3(
      vec3(instanceUvMatrix0.xy, 0.0),
      vec3(instanceUvMatrix0.z, instanceUvMatrix1.x, 0.0),
      vec3(instanceUvMatrix1.yz, 1.0)
    );
    mat3 uvmN = mat3(
      vec3(instanceUvMatrixN0.xy, 0.0),
      vec3(instanceUvMatrixN0.z, instanceUvMatrixN1.x, 0.0),
      vec3(instanceUvMatrixN1.yz, 1.0)
    );
    mat3 uvmE = mat3(
      vec3(instanceUvMatrixE0.xy, 0.0),
      vec3(instanceUvMatrixE0.z, instanceUvMatrixE1.x, 0.0),
      vec3(instanceUvMatrixE1.yz, 1.0)
    );

    mat3 cameraMatrix = mat3(
      vec3(cameraMatrix0.xy, 0.0),
      vec3(cameraMatrix0.z, cameraMatrix1.x, 0.0),
      vec3(cameraMatrix1.yz, 1.0)
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
    vec3 worldPosition = cameraMatrix * m * vec3(posuv, 1.0);
    vec2 vPosition = worldPosition.xy;

    vec2 vUv = (uvm * vec3(posuv, 1.0)).xy;
    vec2 vUvN = (uvmN * vec3(posuv, 1.0)).xy;
    vec2 vUvE = (uvmE * vec3(posuv, 1.0)).xy;

    v0 = vec4(vPosition, vUv);
    v1 = vec4(vUvN, vUvE);
    vAlpha = instanceSize.w;
    vColor = color;

    // スクリーン座標
    vec3 screenPosition = (worldPosition + vec3(-screenSize.x * 0.5, -screenSize.y * 0.5, 0.0)) * vec3(1.0 / (screenSize.x * 0.5), -1.0 / (screenSize.y * 0.5), 0.0);
    screenPosition.z = instancePosition.z * -0.001;
    gl_Position = vec4(screenPosition, 1.0);
  }
}
