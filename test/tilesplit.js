const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const srcFile = process.argv[2];
const TILE_SIZE = Number(process.argv[3]) || 32;

const main = async () => {
  const image = await loadImage(srcFile);

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext("2d");

  for (let x = 0; x < image.width; x += TILE_SIZE) {
    for (let y = 0; y < image.height; y += TILE_SIZE) {

      ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.drawImage(image, x, y, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);

      let hasData = false;
      const imgData = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if ((r == 0 && g == 117 && b == 117 && a == 255) || (r == 255 && g == 106 && b == 171 && a == 255)) {
          data[i + 0] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 0;
        }

        if ((data[i + 0] < 255 || data[i + 1] < 255 || data[i + 2] < 255) || data[i + 3] > 0) {
          hasData = true;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      if (hasData) {
        await new Promise((resolve) => {
          const canvasDst = createCanvas(32, 32);
          const ctxDst = canvasDst.getContext("2d");
          ctxDst.imageSmoothingEnabled = false;
          ctxDst.drawImage(canvas, 0, 0, 32, 32);

          const basename = path.basename(srcFile).split(path.extname(srcFile)).join("");
          const out = fs.createWriteStream("split/" + basename + "-" + pad(y / TILE_SIZE) + "-" + pad(x / TILE_SIZE) + ".png");
          const stream = canvasDst.createPNGStream();
          stream.pipe(out);
          out.on("finish", () => {
            console.log("write" + (x / TILE_SIZE) + "-" + (y / TILE_SIZE));
            resolve();
          });
        });
      }
    }
  }

};

const pad = (num) => {
  const s = "00000000000000000" + num;
  return s.substring(s.length - 2);
};

main();
