const fs = require("fs");
const { createCanvas, registerFont } = require("canvas");


const main = async () => {
  registerFont("Orbitron-Regular.ttf", { family: "font" });

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext("2d");

  ctx.font = "14px 'font'";
  ctx.fillStyle = "white";
  ctx.fillText("ABCDE", 20, 60);

  const out = fs.createWriteStream("./font.png");
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("ok"));
};

main();