const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;
const SCREEN_X = 64;
const SCREEN_Y = 0;
const SCREEN_W = 384;
const SCREEN_H = 512;

phina.main(() => {

  const app = GLApp({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  app.replaceScene(ManagerScene({
    scenes: [{
      label: "loading",
      className: "GLLoadingScene",
      arguments: {
        assets: {
          xml: {
            "test": "./asset/bulletml/test.xml",
          },
          atlas: {
            "common": "./asset/image/common.json",
          },
          vertexShader: {
            "glsprite.vs": "./asset/shader/glsprite.vs",
            "glsinglesprite.vs": "./asset/shader/glsinglesprite.vs",
          },
          fragmentShader: {
            "glsprite.fs": "./asset/shader/glsprite.fs",
            "glsinglesprite.fs": "./asset/shader/glsinglesprite.fs",
          },
        },
      },
    }, {
      label: "glinit",
      className: "GLInitScene",
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
