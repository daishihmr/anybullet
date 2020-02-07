phina.namespace(() => {

  const SPRITE_SCALE = 2;
  const SPRITE_COUNT = 100;

  const spaceship = new psg.Mask([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 1, -1,
    0, 0, 0, 0, 0, 0, 0, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, -1,
    0, 0, 1, 1, 0, 1, 1, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, -1,
    0, 0, 1, 1, 0, 1, 1, 1, -1,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ], 9, 18, true, false);

  phina.define("ShipTextureGenerator", {
    _static: {
      gen: function (scale, seed, params) {
        const R = Random(seed);
        const src = new psg.Sprite(spaceship, ({
          colored: true,
          saturation: 0.8,
          random: () => R.random(),
        }).$extend(params)).canvas;

        const result = Canvas().setSize(src.width * scale, src.height * scale);

        const srcCtx = src.getContext("2d");
        const srcData = srcCtx.getImageData(0, 0, src.width, src.height).data;
        for (let y = 0; y < src.height; y++) {
          for (let x = 0; x < src.width; x++) {
            const r = srcData[(y * src.width + x) * 4 + 0];
            const g = srcData[(y * src.width + x) * 4 + 1];
            const b = srcData[(y * src.width + x) * 4 + 2];
            const a = srcData[(y * src.width + x) * 4 + 3];
            result.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            result.fillRect(x * scale, y * scale, scale, scale);
          }
        }

        return result;
      }
    },
  });
});