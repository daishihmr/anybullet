phina.namespace(() => {

  const TEMP_V = Vector2();
  const TEMP_M = Matrix33();

  phina.define("PositionHelper", {
    _static: {

      rotate: function (x, y, angle) {
        const p = TEMP_V.set(x, y);
        const m = TEMP_M.set(
          Math.cos(angle), -Math.sin(angle), 0,
          Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1,
        );

        return m.multiplyVector2(p);
      },

    },

    init: function () { },
  });
});
