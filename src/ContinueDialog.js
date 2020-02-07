phina.namespace(() => {

  phina.define("ContinueDialog", {
    superClass: "DisplayElement",

    init: function () {
      this.superInit();

      this.fromJSON({
        children: {
          label: {
            className: "Label",
            arguments: {
              text: "continue?",
              fill: "white",
              stroke: null,
              align: "center",
              fontSize: 40,
            },
            x: CANVAS_WIDTH * 0.5,
            y: CANVAS_HEIGHT * 0.4,
          },
          yes: {
            className: "Label",
            arguments: {
              text: "yes : [Z]key",
              fill: "white",
              stroke: null,
              align: "center",
              fontSize: 30,
            },
            x: CANVAS_WIDTH * 0.25,
            y: CANVAS_HEIGHT * 0.6,
          },
          no: {
            className: "Label",
            arguments: {
              text: "no : [X]key",
              fill: "white",
              stroke: null,
              align: "center",
              fontSize: 30,
            },
            x: CANVAS_WIDTH * 0.75,
            y: CANVAS_HEIGHT * 0.6,
          },
        },
      });
    },

    update: function (app) {
      if (app.controlMode == "keyboard") {
        this.yes.text = "yes : [Z]key";
        this.no.text = "no : [X]key";
      } else if (app.controlMode == "gamepad") {
        this.yes.text = "yes : [A]button";
        this.no.text = "no : [B]button";
      }

      if (app.controlMode == "gamepad") {
        const gp = app.gamepads.get();
        if (gp.getKeyDown("a")) {
          this.flare("yes");
        } else if (gp.getKeyDown("b")) {
          this.flare("no");
        }
      } else if (app.controlMode == "keyboard") {
        const kb = app.keyboard;
        if (kb.getKeyDown("z")) {
          this.flare("yes");
        } else if (kb.getKeyDown("x")) {
          this.flare("no");
        }
      }
    },
  });
});
