const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const M = 4;

const R = 0.6;
const G = 1.0;
const B = 0.7;

const S = 0.6;

const main = async () => {

  const image = await loadImage(process.argv[2]);
  const W = image.width;
  const H = image.height;

  const srcCanvas = createCanvas(W, H);
  const srcCtx = srcCanvas.getContext("2d");
  const dstCanvas = createCanvas(W, H);
  const dstCtx = dstCanvas.getContext("2d");

  srcCtx.drawImage(image, 0, 0);

  const data = srcCtx.getImageData(0, 0, W, H).data;
  for (let x = 0; x < W; x += M) {
    for (let y = 0; y < H; y += M) {

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let xx = 0; xx < M; xx++) {
        for (let yy = 0; yy < M; yy++) {
          r += data[((y + yy) * W + x + xx) * 4 + 0];
          g += data[((y + yy) * W + x + xx) * 4 + 1];
          b += data[((y + yy) * W + x + xx) * 4 + 2];
          a += data[((y + yy) * W + x + xx) * 4 + 3];
        }
      }

      r = Math.floor(r / (M * M));
      g = Math.floor(g / (M * M));
      b = Math.floor(b / (M * M));
      a = Math.floor(a / (M * M));

      if (64 < a) {
        r = Math.round(r / 32) * 32;
        g = Math.round(g / 32) * 32;
        b = Math.round(b / 32) * 32;

        r *= R;
        g *= G;
        b *= B;

        let gr = (r + g + b) / 3;
        r = r * S + gr * (1 - S);
        g = g * S + gr * (1 - S);
        b = b * S + gr * (1 - S);

        dstCtx.fillStyle = `rgb(${Math.floor(r * 3.0)}, ${Math.floor(g * 3.0)}, ${Math.floor(b * 3.0)})`;
        dstCtx.fillRect(x - 1, y - 1, M + 1, M + 1);
        dstCtx.fillStyle = `rgb(${Math.floor(r * 1.5)}, ${Math.floor(g * 1.5)}, ${Math.floor(b * 1.5)})`;
        dstCtx.fillRect(x, y, M - 1, M - 1);
      }
    }
  }

  const out = fs.createWriteStream(process.argv[3]);
  const stream = dstCanvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("ok"));
};

main();