const fs = require("fs");
const { createCanvas } = require("canvas");

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext("2d");

const S = 64;
const H = S / 4;
const V = S / 6;

// ctx.fillStyle = "black";
// ctx.fillRect(0, 0, 512, 512);

ctx.strokeStyle = "rgba(255, 255, 255, 0.5);"
ctx.lineWidth = 0.5;
for (let x = 0; x < 512; x += S / 2) {
  for (let y = 0; y < 512; y += S) {
    ctx.beginPath();
    ctx.moveTo(x + H * 2, y + V * 1);
    ctx.lineTo(x + H * 1, y + V * 0);
    ctx.lineTo(x + H * 0, y + V * 1);
    ctx.lineTo(x + H * 0, y + V * 3);
    ctx.lineTo(x + H * 1, y + V * 4);
    ctx.lineTo(x + H * 1, y + V * 6);

    ctx.moveTo(x + H * 1, y + V * 4);
    ctx.lineTo(x + H * 2, y + V * 3);

    ctx.stroke();
  }
}

const out = fs.createWriteStream("./bg.png");
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on("finish", () => console.log("ok"));
