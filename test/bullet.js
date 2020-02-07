const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const SIZE = 64;

const main = async () => {

  await Promise.all(
    drawTasks.map((task, idx) => new Promise((resolve) => {
      const canvas = createCanvas(SIZE, SIZE);
      const ctx = canvas.getContext("2d");

      task(canvas, ctx);

      const out = fs.createWriteStream(`bullet${idx}.png`);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", resolve);
    }))
  );

};

const drawTasks = [];

drawTasks[0] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(220, 100%, 80%)");
    gra.addColorStop(0.5, "hsl(220, 100%, 80%)");
    gra.addColorStop(0.7, "hsl(220, 100%, 50%)");
    gra.addColorStop(1.0, "hsl(220, 100%, 20%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };
  const p2 = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsla(220, 100%, 30%, 1.0)");
    gra.addColorStop(0.5, "hsla(220, 100%, 30%, 1.0)");
    gra.addColorStop(0.8, "hsla(220, 100%, 40%, 1.0)");
    gra.addColorStop(1.0, "hsla(220, 100%, 30%, 0.0)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };
  const p3 = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsla(220, 100%, 65%, 0.3)");
    gra.addColorStop(0.5, "hsla(220, 100%, 65%, 0.2)");
    gra.addColorStop(1.0, "hsla(220, 100%, 40%, 0.0)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.translate(SIZE * 0.5, SIZE * 0.5);

  ctx.save();
  ctx.scale(1.0, 0.90);
  ctx.globalCompositeOperation = "lighter";
  p(0, 0, SIZE * 0.5 * 0.9);
  ctx.restore();

  ctx.save();
  ctx.scale(1.0, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p2(0, 0, SIZE * 0.5 * 0.7);
  ctx.restore();

  ctx.save();
  ctx.translate(12, 3);
  ctx.rotate(0.4);
  ctx.scale(0.7, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p3(0, 0, SIZE * 0.2);
  ctx.restore();

  ctx.save();
  ctx.translate(-12, -3);
  ctx.rotate(0.4);
  ctx.scale(0.7, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p3(0, 0, SIZE * 0.2);
  ctx.restore();
};

drawTasks[1] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(335, 100%, 80%)");
    gra.addColorStop(0.5, "hsl(335, 100%, 80%)");
    gra.addColorStop(0.7, "hsl(335, 100%, 50%)");
    gra.addColorStop(1.0, "hsl(335, 100%, 20%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };
  const p2 = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsla(335, 100%, 30%, 1.0)");
    gra.addColorStop(0.5, "hsla(335, 100%, 30%, 1.0)");
    gra.addColorStop(0.8, "hsla(335, 100%, 40%, 1.0)");
    gra.addColorStop(1.0, "hsla(335, 100%, 30%, 0.0)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };
  const p3 = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsla(335, 100%, 65%, 0.3)");
    gra.addColorStop(0.5, "hsla(335, 100%, 65%, 0.2)");
    gra.addColorStop(1.0, "hsla(335, 100%, 40%, 0.0)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.translate(SIZE * 0.5, SIZE * 0.5);

  ctx.save();
  ctx.scale(1.0, 0.90);
  ctx.globalCompositeOperation = "lighter";
  p(0, 0, SIZE * 0.5 * 0.9);
  ctx.restore();

  ctx.save();
  ctx.scale(1.0, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p2(0, 0, SIZE * 0.5 * 0.7);
  ctx.restore();

  ctx.save();
  ctx.translate(12, 3);
  ctx.rotate(0.4);
  ctx.scale(0.7, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p3(0, 0, SIZE * 0.2);
  ctx.restore();

  ctx.save();
  ctx.translate(-12, -3);
  ctx.rotate(0.4);
  ctx.scale(0.7, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p3(0, 0, SIZE * 0.2);
  ctx.restore();
};

drawTasks[2] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(220, 100%, 30%)");
    gra.addColorStop(0.5, "hsl(220, 100%, 30%)");
    gra.addColorStop(0.7, "hsl(220, 100%, 30%)");
    gra.addColorStop(1.0, "hsl(220, 100%, 20%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };
  const p2 = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsla(220, 100%, 100%, 1.0)");
    gra.addColorStop(0.5, "hsla(220, 100%, 80%, 1.0)");
    gra.addColorStop(0.8, "hsla(220, 100%, 30%, 1.0)");
    gra.addColorStop(1.0, "hsla(220, 100%, 30%, 0.0)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.translate(SIZE * 0.5, SIZE * 0.5);

  ctx.save();
  ctx.scale(1.0, 0.90);
  ctx.globalCompositeOperation = "lighter";
  p(0, 0, SIZE * 0.5 * 0.7);
  ctx.restore();

  ctx.save();
  ctx.scale(1.0, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p2(0, 0, SIZE * 0.5 * 0.5);
  ctx.restore();
};

drawTasks[3] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(335, 100%, 30%)");
    gra.addColorStop(0.5, "hsl(335, 100%, 30%)");
    gra.addColorStop(0.7, "hsl(335, 100%, 30%)");
    gra.addColorStop(1.0, "hsl(335, 100%, 20%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };
  const p2 = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsla(335, 100%, 100%, 1.0)");
    gra.addColorStop(0.5, "hsla(335, 100%, 80%, 1.0)");
    gra.addColorStop(0.8, "hsla(335, 100%, 30%, 1.0)");
    gra.addColorStop(1.0, "hsla(335, 100%, 30%, 0.0)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.translate(SIZE * 0.5, SIZE * 0.5);

  ctx.save();
  ctx.scale(1.0, 0.90);
  ctx.globalCompositeOperation = "lighter";
  p(0, 0, SIZE * 0.5 * 0.7);
  ctx.restore();

  ctx.save();
  ctx.scale(1.0, 1.0);
  ctx.globalCompositeOperation = "source-over";
  p2(0, 0, SIZE * 0.5 * 0.5);
  ctx.restore();
};

drawTasks[4] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(220, 100%, 100%)");
    gra.addColorStop(0.5, "hsl(220, 100%, 80%)");
    gra.addColorStop(0.7, "hsl(220, 100%, 30%)");
    gra.addColorStop(1.0, "hsl(220, 100%, 20%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.translate(SIZE * 0.5, SIZE * 0.5);

  ctx.save();
  ctx.scale(1.0, 0.90);
  ctx.globalCompositeOperation = "lighter";
  p(0, 0, SIZE * 0.2);
  ctx.restore();
};

drawTasks[5] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(335, 100%, 100%)");
    gra.addColorStop(0.5, "hsl(335, 100%, 80%)");
    gra.addColorStop(0.7, "hsl(335, 100%, 30%)");
    gra.addColorStop(1.0, "hsl(335, 100%, 20%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.translate(SIZE * 0.5, SIZE * 0.5);

  ctx.save();
  ctx.scale(1.0, 0.90);
  ctx.globalCompositeOperation = "lighter";
  p(0, 0, SIZE * 0.2);
  ctx.restore();
};

drawTasks[6] = (canvas, ctx) => {
  const p = (x, y, r) => {
    const gra = ctx.createRadialGradient(x, y, 0, x, y, r);
    gra.addColorStop(0.0, "hsl(220, 100%, 20%)");
    gra.addColorStop(1.0, "hsl(220, 100%, 10%)");
    ctx.fillStyle = gra;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  ctx.save();
  ctx.translate(SIZE * 0.5, SIZE * 0.5);
  ctx.globalCompositeOperation = "lighter";

  for (let i = -24; i < 24; i++) {
    
  }

  ctx.restore();
};

main();