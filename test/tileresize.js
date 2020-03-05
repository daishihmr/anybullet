const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const srcFile = process.argv[2];
const TILE_SIZE_SRC = 16;
const TILE_SIZE_DST = 32;
const R = TILE_SIZE_DST / TILE_SIZE_SRC;

const main = async () => {
  const image = await loadImage(srcFile);

  const srcCanvas = createCanvas(image.width, image.height);
  const srcCtx = srcCanvas.getContext("2d");
  srcCtx.drawImage(image, 0, 0);

  const dstCanvas = createCanvas(image.width * R, image.height * R);
  const dstCtx = dstCanvas.getContext("2d");
  dstCtx.imageSmoothingEnabled = false;

  for (let y = 0; y < srcCanvas.height; y += TILE_SIZE_SRC) {
    for (let x = 0; x < srcCanvas.width; x += TILE_SIZE_SRC) {
      dstCtx.drawImage(srcCanvas, x, y, TILE_SIZE_SRC, TILE_SIZE_SRC, x * R, y * R, TILE_SIZE_DST, TILE_SIZE_DST);
    }
  }

  const basename = path.basename(srcFile).split(path.extname(srcFile)).join("");
  const out = fs.createWriteStream(basename + "-resize.png");
  const stream = dstCanvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => {
    console.log("ok");
  });
};

main();
