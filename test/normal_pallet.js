const fs = require("fs");
const { createCanvas } = require("canvas");

const main = async () => {

  let vec = [0, 0, 1];

  const out = fs.createWriteStream("./normal_pallet.png");
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("ok"));
};

main();