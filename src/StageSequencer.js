phina.namespace(() => {

  phina.define("StageSequencer", {
    superClass: "Element",

    init: function () {
      this.superInit();

      this.wait = 0;
      this.val = { done: false };

      this.enemies = [];
      this.checkPoint = 0;
    },

    gen: function* () { },

    restart: function () {
      this.ite = this.gen();
    },
    onmiss: function () {
    },
    oncheckpoint: function () {
      this.enemies.clear();
      this.checkPoint += 1;
    },

    update: function (app) {
      if (Fighter.instance.parent) {
        this.wait -= app.deltaTime;
        if (this.ite) {
          while (!this.val.done && this.wait <= 0) {
            this.val = this.ite.next();
            this.wait = this.val.value;
          }
        }
      }
    },

    launchEnemy: function (className, params, x, y, areaCount = true) {
      const enemy = phina.using(className)(params);
      enemy.x = x + CANVAS_WIDTH * 0.5;
      enemy.y = y;
      this.flare("launch", { enemy });
      if (areaCount) this.enemies.push(enemy);
      return enemy;
    },

    startMusic: function (name, fadeTime, loop) {
      this.flare("startmusic", { name, fadeTime, loop });
    },

    stopMusic: function (fadeTime) {
      this.flare("stopmusic", { fadeTime });
    },

    changeScroll: function (x, y, duration) {
      this.flare("changescroll", { x, y, duration });
    },
  });

});
