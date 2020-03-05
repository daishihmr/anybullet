const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const main = async () => {
  const image = await loadImage(process.argv[2]);

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  const out = fs.createWriteStream(process.argv[2]);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("ok"));
};

main();