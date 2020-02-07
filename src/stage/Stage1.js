phina.namespace(() => {

  phina.define("Stage1", {
    superClass: "StageSequencer",

    init: function () {
      this.superInit()
    },

    gen: function* () {
      let R = Random(12345);
      let cp = 0;
      let a = 0;

      this.changeScroll(0, 0.5, 1);
      yield 2000;

      cp += 1;
      if (this.checkPoint < cp) {
        console.log("area " + cp);
        a = (30).toRadian();
        for (let i = 0; i < 5; i++) {
          const pos0 = PositionHelper.rotate(-50 * i, -25, a);
          this.launchEnemy("TankSmall", { bulletml: "zako", wait: 0, direction: a }, -300 + pos0, -100 + pos0, false);
          const pos1 = PositionHelper.rotate(-50 * i, 25, a);
          this.launchEnemy("TankSmall", { bulletml: "zako", wait: 0, direction: a }, -300 + pos1, -100 + pos1, false);
        }
        a = (170).toRadian();
        for (let i = 0; i < 5; i++) {
          this.launchEnemy("TankSmall", { bulletml: "zako", wait: 200, direction: a }, 400 + Math.cos(a) * -50 * i, -200 + Math.sin(a) * -50 * i, false);
        }
        yield 1500;
        for (let i = 0; i < 3; i++) {
          this.launchEnemy("Zako1", { bulletml: "zako", wait: i * 100 }, -150 + R.randint(-3, 3) * 20, -150 + R.randint(-3, 3) * 20);
        }
        yield 1500;
        for (let i = 0; i < 3; i++) {
          this.launchEnemy("Zako1", { bulletml: "zako", wait: i * 100 }, 150 + R.randint(-3, 3) * 20, -150 + R.randint(-3, 3) * 20);
        }
        yield 1500;
        for (let i = 0; i < 3; i++) {
          this.launchEnemy("Zako1", { bulletml: "zako", wait: i * 100 }, -150 + R.randint(-3, 3) * 20, -150 + R.randint(-3, 3) * 20);
          this.launchEnemy("Zako1", { bulletml: "zako", wait: i * 100 }, 150 + R.randint(-3, 3) * 20, -150 + R.randint(-3, 3) * 20);
        }

        while (this.enemies.some(e => e.parent)) yield 10;
        this.flare("checkpoint");
      }

      cp += 1;
      if (this.checkPoint < cp) {
        console.log("area " + cp);
        a = (-180).toRadian();
        for (let i = 0; i < 5; i++) {
          this.launchEnemy("TankSmall", { bulletml: "zako", wait: 0, direction: a }, 300 + Math.cos(a) * -50 * i, -100 + Math.sin(a) * -50 * i, false);
        }
        a = (-20).toRadian();
        for (let i = 0; i < 5; i++) {
          this.launchEnemy("TankSmall", { bulletml: "zako", wait: 0, direction: a }, -300 + Math.cos(a) * -50 * i, 500 + Math.sin(a) * -50 * i, false);
        }
        a = (90).toRadian();
        for (let i = 0; i < 5; i++) {
          this.launchEnemy("TankSmall", { bulletml: "zako", wait: 0, direction: a }, 20 + Math.cos(a) * -50 * i, -140 + Math.sin(a) * -50 * i, false);
        }
        yield 1500;
        for (let i = 0; i < 10; i++) {
          this.launchEnemy("Zako1", { bulletml: "zako", wait: i * 100 }, -150 + R.randint(-3, 3) * 20, -150 + R.randint(-3, 3) * 20);
          this.launchEnemy("Zako1", { bulletml: "zako", wait: i * 100 }, 150 + R.randint(-3, 3) * 20, -150 + R.randint(-3, 3) * 20);
        }

        while (this.enemies.some(e => e.parent)) yield 10;
        this.flare("checkpoint");
      }

      cp += 1;
      if (this.checkPoint < cp) {
        console.log("area " + cp);
        yield 1500;
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 0 }, -100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 100 }, -150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 200 }, -80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 300 }, 100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 400 }, 150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 500 }, 80, -140);

        yield 1500;
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 0 }, -100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 100 }, -150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 200 }, -80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 300 }, 100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 400 }, 150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 500 }, 80, -140);

        yield 1500;
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 0 }, -100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 100 }, -150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 200 }, -80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 300 }, 100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 400 }, 150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 500 }, 80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 600 }, -100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 700 }, -150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 800 }, -80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 900 }, 100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 1000 }, 150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 1100 }, 80, -140);

        while (this.enemies.some(e => e.parent)) yield 10;
        this.flare("checkpoint");
      }

      cp += 1;
      if (this.checkPoint < cp) {
        console.log("area " + cp);
        yield 1500;

        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 0, toX: -30 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 600, toX: 60 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 1200, toX: -180 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 1800, toX: 150 }, 0, -100);

        while (this.enemies.some(e => e.parent)) yield 10;
        this.flare("checkpoint");
      }

      cp += 1;
      if (this.checkPoint < cp) {
        console.log("area " + cp);
        yield 1500;

        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 0, toX: -250 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 0, toX: 250 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 1200, toX: -250 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 1200, toX: 250 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 1800, toX: -250 }, 0, -100);
        this.launchEnemy("Middle1", { bulletml: "middle1", wait: 1800, toX: 250 }, 0, -100);

        this.launchEnemy("Zako2", { bulletml: "zako", wait: 0 }, -100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 100 }, -150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 200 }, -80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 300 }, 100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 400 }, 150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 500 }, 80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 600 }, -100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 700 }, -150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 800 }, -80, -140);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 900 }, 100, -100);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 1000 }, 150, -180);
        this.launchEnemy("Zako2", { bulletml: "zako", wait: 1100 }, 80, -140);

        while (this.enemies.some(e => e.parent)) yield 10;
        this.flare("checkpoint");
      }
    },

  });

});
