const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 512;
const SCREEN_X = 114;
const SCREEN_Y = 0;
const SCREEN_W = CANVAS_WIDTH - SCREEN_X * 2;
const SCREEN_H = 512;

phina.main(() => {

  const app = GLApp({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  app.replaceScene(ManagerScene({
    scenes: [{
      label: "loading",
      className: "GLLoadingScene",
      arguments: {
        assets: {
          image: {
            "black": "./asset/image/black.png",
            "no_normal": "./asset/image/no_normal.png",
            "test": "./asset/test/fighter_big.png",
            "test_n": "./asset/test/fighter_big_n.png",
          },
          xml: {
            "test": "./asset/bulletml/test.xml",
          },
          atlas: {
            "common": "./asset/image/common.json",
          },
          vertexShader: {
            "glsprite.vs": "./asset/shader/glsprite.vs",
            "glsinglesprite.vs": "./asset/shader/glsinglesprite.vs",
            "gltiledmap.vs": "./asset/shader/gltiledmap.vs",
          },
          fragmentShader: {
            "glsprite.fs": "./asset/shader/glsprite.fs",
            "glsinglesprite.fs": "./asset/shader/glsinglesprite.fs",
            "gltiledmap.fs": "./asset/shader/gltiledmap.fs",
          },
          tiled: {
            "test": "./asset/map/test.json",
          },
        },
      },
    }, {
      label: "glinit",
      className: "GLInitScene",
      arguments: {
        common: { atlas: "common", max: 3000 },
      },
    }, {
      label: "main",
      className: "MainScene2",
      arguments: {
        app: app,
      },
    }],
  }));

  app.gamepads = GamepadManager();
  app.update = () => {
    app.gamepads.update();

    const gp = app.gamepads.get();
    if (gp) {
      if ((0.5 * 0.5) < gp.getStickDirection(0).lengthSquared() || (0.5 * 0.5) < gp.getStickDirection(1).lengthSquared() || gp.buttons.some(b => b.down)) {
        app.controlMode = "gamepad";
      }
    }
  };
  app.enableStats();
  app.run();

  document.addEventListener("keydown", () => app.controlMode = "keyboard");
  document.addEventListener("mousedown", () => app.controlMode = "keyboard");

});
