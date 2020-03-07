phina.namespace(() => {

  phina.define("FitScreen", {

    init: function () { },

    _static: {
      fit: function (canvas) {
        document.body.style.overflow = "hidden";

        const _fitFunc = () => {
          const e = canvas;
          const s = e.style;

          s.position = "absolute";
          s.margin = "auto";
          s.left = "0px";
          s.top = "0px";
          s.bottom = "0px";
          s.right = "0px";

          const rateWidth = SCREEN_W / window.innerWidth;
          const rateHeight = SCREEN_H / window.innerHeight;
          const screenRate = SCREEN_H / SCREEN_W;
          const canvasRate = CANVAS_HEIGHT / CANVAS_WIDTH;

          if (rateWidth > rateHeight) {
            s.width = Math.floor(innerWidth * screenRate / canvasRate) + "px";
            s.height = Math.floor(innerWidth * screenRate) + "px";
            s.left = Math.floor((innerWidth - innerWidth * screenRate / canvasRate) / 2) + "px";
          } else {
            s.width = Math.floor(innerHeight / canvasRate) + "px";
            s.height = Math.floor(innerHeight) + "px";
            s.left = Math.floor((innerWidth - innerHeight / canvasRate) / 2) + "px";
          }
        };

        _fitFunc();

        phina.global.addEventListener("resize", _fitFunc, false);
      },
    },

  });

});
