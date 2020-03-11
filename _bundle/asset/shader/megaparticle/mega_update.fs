precision mediump float;

void main(void) {
  vec2 c = gl_PointCoord * 4.0 - vec2(0.5);
  float stateSection = floor(c.y * 4.0 + c.x);
  if (stateSection == 0.0) {
    gl_FragColor = vec4(
      // spawn_time
      0.0,
      // r_from
      0.0,
      // g_from
      0.0,
      // b_from
      0.0
    );
  } else if (stateSection == 1.0) {
    gl_FragColor = vec4(
      // a_from
      0.0,
      // r_to
      0.0,
      // g_to
      0.0,
      // b_to
      0.0
    );
  } else if (stateSection == 2.0) {
    gl_FragColor = vec4(
      // a_to
      0.0,
      // life
      0.0,
      // x
      0.0,
      // y
      0.0
    );
  } else if (stateSection == 3.0) {
    gl_FragColor = vec4(
      // vx
      0.0,
      // vy
      0.0,
      // gx
      0.0,
      // gy
      0.0
    );
  } else if (stateSection == 4.0) {
    gl_FragColor = vec4(
      // rac_x
      0.0,
      // rac_y
      0.0,
      // tac_x
      0.0,
      // tac_y
      0.0
    );
  } else if (stateSection == 5.0) {
    gl_FragColor = vec4(
      // pos_angle
      0.0,
      // rot_per_sec
      0.0,
      // pos_radius_from
      0.0,
      // pos_radius_to
      0.0
    );
  } else if (stateSection == 6.0) {
    gl_FragColor = vec4(
      // scaleX_from
      0.0,
      // scaleX_to
      0.0,
      // scaleY_from
      0.0,
      // scaleY_to
      0.0
    );
  } else if (stateSection == 7.0) {
    gl_FragColor = vec4(
      // rot_from
      0.0,
      // rot_to
      0.0,
      // life
      0.0,
      // 
      0.0
    );
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}

