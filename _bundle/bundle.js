phina.namespace(() => {

  phina.define("Background", {
    superClass: "DisplayElement",

    init: function (params) {
      this.superInit();

      this.speed = params.speed;
      const spriteArray = params.spriteArray;

      this.fromJSON({
        children: Array.range(0, 9).map(() => {
          return {
            className: "GLSprite",
            arguments: {
              spriteArray,
              image: "bg.png",
            },
            scaleX: 512 / 1024, scaleY: 512 / 1024,
            z: 20,
          };
        }),
      });

      this.scrollX = 0;
      this.scrollY = 0;
      this.vx = 0;
      this.vy = 0;
    },

    update: function() {
      this.scrollX += this.vx * this.speed;
      this.scrollY += this.vy * this.speed;
    },

    _accessor: {
      scrollX: {
        get: function () {
          return this._scrollX;
        },
        set: function (v) {
          this._scrollX = v;
          const base = CANVAS_WIDTH * 0.5 + this._scrollX % 512;
          this.children[0].x = base + 512 * -1;
          this.children[1].x = base + 512 * 0;
          this.children[2].x = base + 512 * 1;
          this.children[3].x = base + 512 * -1;
          this.children[4].x = base + 512 * 0;
          this.children[5].x = base + 512 * 1;
          this.children[6].x = base + 512 * -1;
          this.children[7].x = base + 512 * 0;
          this.children[8].x = base + 512 * 1;
        },
      },
      scrollY: {
        get: function () {
          return this._scrollY;
        },
        set: function (v) {
          this._scrollY = v;
          const base = CANVAS_HEIGHT * 0.5 + this._scrollY % 512;
          this.children[0].y = base + 512 * -1;
          this.children[1].y = base + 512 * -1;
          this.children[2].y = base + 512 * -1;
          this.children[3].y = base + 512 * 0;
          this.children[4].y = base + 512 * 0;
          this.children[5].y = base + 512 * 0;
          this.children[6].y = base + 512 * 1;
          this.children[7].y = base + 512 * 1;
          this.children[8].y = base + 512 * 1;
        },
      },
    },
  });

});

phina.namespace(() => {

  phina.define("Bullet", {
    superClass: "GLSprite",

    init: function (params) {
      this.superInit({
        spriteArray: params.spriteArray,
        image: "bullet0.png",
      });

      this.bullet = null;
      this.power = 0;
      this.r = 0;
      this.dummy = false;

      this.setScale(0.5, 0.5);
      this.brightness = 1.5;
    },

    update: function () {
      this.x = this.bullet.x;
      this.y = this.bullet.y;
      this.rotation += 10;
      if (this.x < CANVAS_WIDTH * -0.1 || CANVAS_WIDTH * 1.1 <= this.x || this.y < CANVAS_HEIGHT * -0.1 || CANVAS_HEIGHT * 1.1 <= this.y) {
        this.remove();
      }
    },

    setBullet: function (bullet, spec) {
      this.x = bullet.x;
      this.y = bullet.y;

      this.bullet = bullet;
      this.bullet.onVanish = () => this.remove();

      this.power = 1;
      this.r = 12;

      this.dummy = false;
      this.visible = true;

      if (spec.label) {
        if (spec.label.startsWith("dummy")) {
          this.dummy = true;
          this.visible = false;
        } else {
          this.setImage(spec.label);
        }
      }
    },

    onremoved: function () {
      this.bullet.destroy();
      this.bullet = null;
    },
  });

});

phina.namespace(() => {

  const A = Vector2();
  const B = Vector2();
  const S = Vector2();
  const V = Vector2();

  phina.define("CollisionHelper", {
    _static: {

      hitTestCircleCircle: function (a, b) {
        // console.log(a.r, b.r);
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) <= a.r + b.r;
      },

      hitTestCircleLine: function (circle, line) {
        S.set(line.b.x - line.a.x, line.b.y - line.a.y);
        A.set(circle.x - line.a.x, circle.y - line.a.y);
        B.set(circle.x - line.b.x, circle.y - line.b.y);
        const radSq = circle.r * circle.r;

        if (A.lengthSquared() <= radSq || B.lengthSquared() <= radSq) {
          return true;
        } else if (Math.abs(Vector2.cross(S, A)) / S.length() > circle.r) {
          return false;
        } else {
          return Vector2.dot(A, S) * Vector2.dot(B, S) <= 0;
        }
      },

      raycast: function (origin, vector, circle) {
        V.set(vector.x, vector.y);
        V.normalize();

        let ox = circle.x;
        let oy = circle.y;
        let r = circle.r;
        let ax = origin.x;
        let ay = origin.y;
        let vx = V.x;
        let vy = V.y;

        if (vx === 0.0 && vy === 0.0) return null;

        // ÂßãÁÇπ„ÅåÂÜÜÂÜÖ„Å´„ÅÇ„ÇãÂ†¥Âêà„ÅØÂßãÁÇπ„ÅåË°ùÁ™ÅÂú∞ÁÇπ„Å®„Åô„Çã
        if ((ax - ox) * (ax - ox) + (ay - oy) * (ay - oy) <= r * r) return origin;

        // ÂÜÜ„ÅÆ‰∏≠ÂøÉÁÇπ„ÅåÂéüÁÇπ„Å´„Å™„Çã„Çà„ÅÜ„Å´ÂßãÁÇπ„Çí„Ç™„Éï„Çª„ÉÉ„Éà
        ax -= ox;
        ay -= oy;

        // ‰øÇÊï∞t„ÇíÁÆóÂá∫
        const dotAV = ax * vx + ay * vy;
        const dotAA = ax * ax + ay * ay;
        let s = dotAV * dotAV - dotAA + r * r;
        if (Math.abs(s) < 0.000001) {
          s = 0.0; // Ë™§Â∑Æ‰øÆÊ≠£
        }

        if (s < 0.0) return null; // Ë°ùÁ™Å„Åó„Å¶„ÅÑ„Å™„ÅÑ

        const sq = Math.sqrt(s);
        const t1 = -dotAV - sq;
        const t2 = -dotAV + sq;

        // „ÇÇ„Åót1Âèä„Å≥t2„Åå„Éû„Ç§„Éä„Çπ„Å†„Å£„Åü„ÇâÂßãÁÇπ„Åå
        // ÂÜÜÂÜÖ„Å´„ÇÅ„ÇäËæº„Çì„Åß„ÅÑ„Çã„ÅÆ„Åß„Ç®„É©„Éº„Å®„Åô„Çã
        if (t1 < 0.0 || t2 < 0.0) return null;

        // Ë°ùÁ™ÅÂ∫ßÊ®ô„ÇíÂá∫Âäõ
        return {
          x: ax + t1 * vx + ox,
          y: ay + t1 * vy + oy
        };
        // { x: ax + t2 * vx + ox, y: ay + t2 * vy + oy };
      },

    },

    init: function () { },
  });

});

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

phina.namespace(() => {

  phina.define("Enemy", {
    superClass: "DisplayElement",

    entered: false,
    killed: false,

    hp: 0,
    r: 0,
    power: 1,

    bullet: null,
    type: null,

    init: function (params) {
      this.superInit();

      this.type = "air";
      this.pubTw = Tweener().attachTo(this);

      this.bullet = BulletML.Bullet.get();
      if (params.bulletml) {
        this.bulletml = AssetManager.get("xml", params.bulletml).data;
      }

      this.entered = false;
      this.killed = false;

      this.tweener
        .clear()
        .wait(params.wait)
        .call(() => this.start());
    },

    onremoved: function () {
      if (this.bullet) {
        this.bullet.destroy();
        this.bullet = null;
      }
    },

    start: function () {
    },

    pauseAttack: function () {
      if (this.bullet && this.bullet.runner) {
        this.bullet.runner.running = false;
      }
    },
    resumeAttack: function () {
      if (this.bullet && this.bullet.runner) {
        this.bullet.runner.running = true;
      }
    },

    update: function (app) {
      if (this.bullet) {
        this.bullet.x = this.x;
        this.bullet.y = this.y;
      }
      if (!this.entered && this.inScreen()) {
        this.entered = true;
        this.flare("enter");
      }
    },

    damage: function (power) {
      if (!this.entered) return false;

      this.hp -= power;
      const killed = this.hp <= 0;
      if (killed) {
        this.flare("killed");
      }

      return killed;
    },

    inScreen: function () {
      return 0 <= this.x && this.x < CANVAS_WIDTH && 0 <= this.y && this.y < CANVAS_HEIGHT;
    },
    inWorld: function () {
      return CANVAS_WIDTH * -0.2 <= this.x && this.x < CANVAS_WIDTH * 1.2 && CANVAS_HEIGHT * -0.2 <= this.y && this.y < CANVAS_HEIGHT * 1.2;
    },
  });

});

phina.namespace(() => {

  const SPEED = 0.3;
  const SPEED_SLOW = SPEED * 0.5;
  const HEAT_BY_FIRE = 100;

  const controller = {
    moveDelta: Vector2(0, 0),
    fire: false,
    bomb: false,
    slow: false,
  };

  phina.define("Fighter", {
    superClass: "GLSprite",

    _static: {
      instance: null,
    },

    init: function (params) {
      this.superInit({
        spriteArray: params.spriteArray,
        image: "fighterC4.png",
      });

      Fighter.instance = this;

      this.r = 0;
      this.boundingType = "circle";
      this.controllable = false;
      this._muteki = true;
      this.heat = 0;

      this.controlMode = "keyboard";
    },

    update: function (app) {
      if (this.controllable) {
        const dt = app.deltaTime;

        if (app.controlMode == "gamepad") {
          const gp = app.gamepads.get();
          const ls = gp.getStickDirection();

          controller.moveDelta.x = Math.round(ls.x);
          controller.moveDelta.y = Math.round(ls.y);
          controller.fire = gp.getKey("r2") || gp.getKey("x");
          controller.slow = gp.getKey("a");
        } else if (app.controlMode == "keyboard") {
          const kb = app.keyboard;

          controller.moveDelta.x = (kb.getKey("a") || kb.getKey("left")) ? -1 : (kb.getKey("d") || kb.getKey("right")) ? 1 : 0
          controller.moveDelta.y = (kb.getKey("w") || kb.getKey("up")) ? -1 : (kb.getKey("s") || kb.getKey("down")) ? 1 : 0
          controller.fire = kb.getKey("z");
          controller.slow = kb.getKey("shift");
        }

        controller.moveDelta.normalize();
        const speed = controller.slow ? SPEED_SLOW : SPEED;

        this.position.x += controller.moveDelta.x * speed * dt;
        this.position.y += controller.moveDelta.y * speed * dt;
        this.position.x = Math.clamp(this.position.x, SCREEN_X + 10, SCREEN_X + SCREEN_W - 10);
        this.position.y = Math.clamp(this.position.y, SCREEN_Y + 10, SCREEN_Y + SCREEN_H - 10);

        if (controller.fire && this.heat <= 0) {
          if (controller.slow) {
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.02, pos: { x: -24, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.01, pos: { x: -16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: -6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: 6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.01, pos: { x: 16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.02, pos: { x: 24, y: 20 } });
          } else {
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.2, pos: { x: -24, y: 28 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 - 0.1, pos: { x: -16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: -6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5, pos: { x: 6, y: 0 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.1, pos: { x: 16, y: 20 } });
            this.flare("firebullet", { angle: Math.PI * -0.5 + 0.2, pos: { x: 24, y: 28 } });
          }
          this.heat = HEAT_BY_FIRE;
        }

        this.heat -= dt;
      } else {
        this.heat = 0;
      }
    },

    launch: function () {
      this.tweener
        .clear()
        .set({
          visible: true,
          x: SCREEN_X + SCREEN_W * 0.2,
          y: SCREEN_Y + SCREEN_H * 1.2,
          controllable: false,
          muteki: true,
        })
        .wait(1000)
        .to({
          y: SCREEN_Y + SCREEN_H * 0.9,
        }, 800, "easeOutBack")
        .set({
          controllable: true,
        })
        .wait(1000)
        .set({
          muteki: false,
        });

      return this;
    },

    damage: function (power) {
      // this.killed();
    },

    killed: function () {
      this.controllable = false;
      this.muteki = true;
      this.flare("killed");
    },

    _accessor: {
      muteki: {
        get: function () {
          return this._muteki;
        },
        set: function (v) {
          this._muteki = v;
        },
      }
    }
  });

});

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

phina.namespace(() => {

  phina.define("GLInitScene", {
    superClass: "Scene",

    init: function (options) {
      this.superInit();

      const renderer = options.app.renderer;
      const spec = options.spriteArray;
      for (let name in spec) {
        renderer.addSpriteArray(name, spec[name].atlas, spec[name].max);
      }
      this.one("enterframe", () => this.start());
    },

    start: function () {
      this.exit();
    },
  });

});

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

phina.namespace(() => {

  phina.define("MainScene", {
    superClass: "DisplayScene",

    init: function () {
      this.superInit();

      this.fromJSON({
        children: {
          seq: { className: "Stage1" },
          bgC: {
            className: "RectangleShape",
            arguments: {
              fill: (() => {
                const c = document.createElement("canvas");
                c.width = CANVAS_WIDTH;
                c.height = CANVAS_HEIGHT;
                const ctx = c.getContext("2d");
                const gra = ctx.createRadialGradient(0, CANVAS_HEIGHT * -0.2, 0, 0, 0, CANVAS_HEIGHT * 0.5);
                gra.addColorStop(0.0, "hsl(220, 90%, 10%)");
                gra.addColorStop(1.0, "hsl(220, 90%, 0%)");
                return gra;
              })(),
              stroke: null,
              padding: 0,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            },
            originX: 0,
            originY: 0,
          },
          bg0: { className: "Background", arguments: { speed: 1.0 }, scaleX: 1, scaleY: 1 },
          bg1: { className: "Background", arguments: { speed: 0.8 }, scaleX: 0.8, scaleY: 0.8, alpha: 0.5 },
          fighterLayer: { className: "DisplayElement" },
          shotLayer: { className: "DisplayElement" },
          enemyLayer: { className: "DisplayElement" },
          effectLayer: { className: "DisplayElement" },
          bulletLayer: { className: "DisplayElement" },
          black: {
            className: "RectangleShape",
            arguments: {
              fill: "black",
              stroke: null,
              padding: 0,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            },
            originX: 0,
            originY: 0,
          },
          uiLayer: { className: "DisplayElement" },
        },
      });

      // fighter
      const fighter = Fighter().hide();
      fighter.on("firebullet", ({ angle, pos }) => {
        const shot = this.shotBullets.find(s => !s.parent);
        if (shot) {
          shot
            .setAngle(angle)
            .setPosition(fighter.x + pos.x, fighter.y + pos.y)
            .addChildTo(this.shotLayer);
        } else {
          console.log("„Ç∑„Éß„ÉÉ„Éà„Åü„Çä„Å™„ÅÑ");
        }
      });
      fighter.on("killed", () => {
        this.black.tweener.clear().fadeIn(500);
        fighter.remove();
        this.vanishAllEnemy();
        this.seq.flare("miss");
        const dialog = ContinueDialog().addChildTo(this.uiLayer);
        dialog.on("yes", () => {
          dialog.remove();
          this.restart();
        });
        dialog.on("no", () => {
          dialog.remove();
          this.exit();
        });
      });
      this.fighter = fighter;

      // shot
      this.shotBullets = Array.range(0, 300).map(() => ShotBullet());

      // bullet
      this.bullets = Array.range(0, 3000).map(() => Bullet());
      const bulletmlManager = new BulletML.Manager({ player: fighter });
      this.on("enterframe", () => bulletmlManager.update());
      bulletmlManager.onFire = ({ bullet, spec }) => {
        const b = this.bullets.find(b => !b.parent);
        if (b) {
          b.setBullet(bullet, spec);
        } else {
          console.log("Âºæ„Åü„Çä„Å™„ÅÑ");
        }
        b.addChildTo(this.bulletLayer);
      };
      this.bulletmlManager = bulletmlManager;

      // enemy
      this.enemies = [];
      this.seq.on("launch", ({ enemy }) => {
        this.enemies.push(enemy);
        enemy.on("effect", ({ type }) => {
          switch (type) {
            case "smallExplosion":
              break;
            case "middleExplosion":
              break;
            case "largeExplosion":
              break;
          }
        });
        enemy.on("killed", () => {
          enemy.remove();
        });
        enemy.on("removed", () => this.enemies.erase(enemy));
        if (enemy.bulletml) {
          enemy.on("attack", () => {
            const bulletmlRoot = BulletML.parse(enemy.bulletml);
            bulletmlManager.run(enemy.bullet, bulletmlRoot);
          });
        }
        enemy.addChildTo(this.enemyLayer);
      });

      // stage
      this.seq.on("changescroll", ({ x, y, duration }) => {
        this.bg0.tweener.clear().to({ vx: x, vy: y }, duration);
        this.bg1.tweener.clear().to({ vx: x, vy: y }, duration);
      });
      this.seq.on("checkpoint", () => {
        console.log("checkpoint");
      });

      this.one("enterframe", () => this.restart());
    },

    restart: function () {
      this.black.tweener.clear().fadeOut(500);
      this.seq.restart();
      this.fighter.addChildTo(this.fighterLayer);
      this.fighter.launch();
    },

    update: function () {
      // „Ç∑„Éß„ÉÉ„ÉàvsÊïµ
      for (let i = 0, il = this.shotBullets.length; i < il; i++) {
        const s = this.shotBullets[i];
        if (s.parent) {
          for (let j = 0, jl = this.enemies.length; j < jl; j++) {
            const e = this.enemies[j];
            if (CollisionHelper.hitTestCircleLine(e, s)) {
              if (e.damage(s.power)) {
                this.enemies.erase(e);
              }
              const hitPoint = CollisionHelper.raycast(s.a, s.velocity, e);
              if (hitPoint) {
                this.hitEffect(hitPoint.x, hitPoint.y);
              }
              s.remove();
              break;
            }
          }
        }
      }

      if (!this.fighter.muteki) {
        // ÊïµvsËá™Ê©ü
        for (let i = 0, il = this.enemies.length; i < il; i++) {
          const e = this.enemies[i];
          if (e.parent && e.type == "air") {
            if (CollisionHelper.hitTestCircleCircle(e, this.fighter)) {
              this.fighter.damage(e.power);
            }
          }
        }

        // ÂºævsËá™Ê©ü
        for (let i = 0, il = this.bullets.length; i < il; i++) {
          const b = this.bullets[i];
          if (b.parent && !b.dummy) {
            if (CollisionHelper.hitTestCircleCircle(b, this.fighter)) {
              this.fighter.damage(b.power);
              b.remove();
            }
          }
        }
      } else {
        this.vanishAllBullet();
      }

      // Âú∞‰∏äÁâ©ÁßªÂãï
      for (let i = 0, il = this.enemies.length; i < il; i++) {
        const e = this.enemies[i];
        if (e.parent && e.type == "ground") {
          e.x += this.bg0.vx;
          e.y += this.bg0.vy;
        }
      }
    },

    vanishAllEnemy: function () {
      this.enemies.forEach(e => {
        e.pubTw
          .clear()
          .fadeOut(500)
          .call(() => e.remove());
      });
    },

    vanishAllBullet: function () {
      this.bullets.forEach(b => {
        if (b.parent) {
          b.remove();
          this.vanishEffect(b.x, b.y);
        }
      });
    },

    hitEffect: function (x, y) {

    },

    vanishEffect: function (x, y) {

    },
  });

});

phina.namespace(() => {

  // ZÂÄ§
  // BG 20
  // Enemy 30
  // Fighter 40
  // Shot 50
  // Effect 60
  // Bullet 70ÔΩû100
  // UI 100ÔΩû

  phina.define("MainScene2", {
    superClass: "GLScene",

    init: function (params) {
      this.superInit();

      const renderer = params.app.renderer;
      const gl = params.app.gl;

      const commonArray = renderer.getSpriteArray("common");

      this.bulletTree = new DaiCol.LinearQuadTreeSpace(CANVAS_WIDTH, CANVAS_HEIGHT, 2);
      this.enemyTree = new DaiCol.LinearQuadTreeSpace(CANVAS_WIDTH, CANVAS_HEIGHT, 2);
      this.shotBulletTree = new DaiCol.LinearQuadTreeSpace(CANVAS_WIDTH, CANVAS_HEIGHT, 2);
      this.fighterTree = new DaiCol.LinearQuadTreeSpace(CANVAS_WIDTH, CANVAS_HEIGHT, 2);

      this.fromJSON({
        children: {
          seq: { className: "Stage1" },
          sideL: {
            className: "GLSprite",
            arguments: {
              spriteArray: commonArray,
              image: "black.png",
            },
            originX: 0, originY: 0,
            scaleX: SCREEN_X / 32, scaleY: SCREEN_H / 32,
            z: 100,
          },
          sideR: {
            className: "GLSprite",
            arguments: {
              spriteArray: commonArray,
              image: "black.png",
            },
            originX: 1, originY: 0,
            scaleX: (CANVAS_WIDTH - SCREEN_X - SCREEN_W) / 32, scaleY: SCREEN_H / 32,
            x: CANVAS_WIDTH,
            z: 100,
          },
          // bg: { className: "Background", arguments: { spriteArray: commonArray, speed: 1.0 } },
          black: {
            className: "GLSprite",
            arguments: {
              spriteArray: commonArray,
              image: "black.png",
              alphaEnabled: true,
            },
            originX: 0, originY: 0,
            scaleX: CANVAS_WIDTH / 32, scaleY: CANVAS_HEIGHT / 32,
            z: 100,
          },
        },
      });

      // fighter
      const fighter = Fighter({ spriteArray: commonArray })
        .setZ(40)
        .hide();
      fighter.on("firebullet", ({ angle, pos }) => {
        const shot = this.shotBullets.find(s => !s.parent);
        if (shot) {
          shot
            .setAngle(angle)
            .setPosition(fighter.x + pos.x, fighter.y + pos.y)
            .addChildTo(this);
        } else {
          console.log("„Ç∑„Éß„ÉÉ„Éà„Åü„Çä„Å™„ÅÑ");
        }
      });
      fighter.on("killed", () => {
        this.black.tweener.clear().fadeIn(500);
        fighter.remove();
        this.vanishAllEnemy();
        this.seq.flare("miss");
        // const dialog = ContinueDialog().addChildTo(this.uiLayer);
        // dialog.on("yes", () => {
        //   dialog.remove();
        //   this.restart();
        // });
        // dialog.on("no", () => {
        //   dialog.remove();
        //   this.exit();
        // });
      });
      this.fighter = fighter;

      // shot
      this.shotBullets = Array.range(0, 300).map(() => {
        return ShotBullet({ spriteArray: commonArray }).setZ(50);
      });

      // bullet
      this.bullets = Array.range(0, 7000).map(() => {
        return Bullet({ spriteArray: commonArray });
      });
      const bulletmlManager = new BulletML.Manager({ player: fighter });
      this.on("enterframe", () => bulletmlManager.update());
      let bulletZ = 70;
      bulletmlManager.onFire = ({ bullet, spec }) => {
        const b = this.bullets.find(b => !b.parent);
        if (b) {
          b.setBullet(bullet, spec);
          bulletZ += 0.001;
          if (100 < bulletZ) bulletZ = 70;
          b.setZ(bulletZ);
          b.addChildTo(this);
        } else {
          console.log("Âºæ„Åü„Çä„Å™„ÅÑ");
        }
      };
      this.bulletmlManager = bulletmlManager;

      // enemy
      this.enemies = [];

      // stage
      this.seq.on("changescroll", ({ x, y, duration }) => {
        this.bg.tweener.clear().to({ vx: x, vy: y }, duration);
      });
      this.seq.on("checkpoint", () => {
        console.log("checkpoint");
      });

      this.one("enterframe", () => this.restart());

      GLTiledMap({ gl, tiledAsset: "test" })
        .setZ(20.1)
        .addChildTo(this);
      GLSingleSprite({ gl, image: "test" })
        .setPosition(256, 100)
        .setZ(40.1)
        .addChildTo(this);
    },

    restart: function () {
      this.black.tweener.clear().fadeOut(500);
      // this.seq.restart();
      this.fighter.addChildTo(this);
      this.fighter.launch();
    },

    update: function () {
      const bulletTree = this.bulletTree;
      const enemyTree = this.enemyTree;
      const shotBulletTree = this.shotBulletTree;
      const fighterTree = this.fighterTree;

      bulletTree.clear();
      for (let i = 0, len = this.bullets.length; i < len; i++) {
        const b = this.bullets[i];
        if (b.parent || b.visible) bulletTree.addActor(b);
      }
      enemyTree.clear();
      for (let i = 0, len = this.enemies.length; i < len; i++) {
        const e = this.enemies[i];
        if (e.parent && e.visible) enemyTree.addActor(e);
      }
      shotBulletTree.clear();
      for (let i = 0, len = this.shotBullets.length; i < len; i++) {
        const s = this.shotBullets[i];
        if (s.parent) shotBulletTree.addActor(s);
      }
      fighterTree.clear();
      if (this.fighter.parent && !this.fighter.muteki) fighterTree.addActor(this.fighter);

      // shot vs enemy
      DaiCol.hitTest(shotBulletTree, enemyTree, (s, e) => {
        if (s.parent && e.parent) {
          if (CollisionHelper.hitTestCircleLine(e, s)) {
            e.damage(s.power);
            s.hit();
          }
        }
      });

      // fighter vs bullet
      if (this.fighter.parent && !this.fighter.muteki) {
        DaiCol.hitTest(fighterTree, bulletTree, (f, b) => {
          if (f.parent && b.parent) {
            if (CollisionHelper.hitTestCircleCircle(f, b)) {
              f.damage(b.power);
              b.remove();
            }
          }
        });
      }

      // fighter vs enemy
      if (this.fighter.parent && !this.fighter.muteki) {
        DaiCol.hitTest(fighterTree, enemyTree, (f, e) => {
          if (f.parent && e.parent && e.type === "air") {
            if (CollisionHelper.hitTestCircleCircle(f, e)) {
              f.damage(e.power);
            }
          }
        });
      }
    }
  });

});

phina.namespace(() => {

  const TEMP_V = Vector2();
  const TEMP_M = Matrix33();

  phina.define("PositionHelper", {
    _static: {

      rotate: function (x, y, angle) {
        const p = TEMP_V.set(x, y);
        const m = TEMP_M.set(
          Math.cos(angle), -Math.sin(angle), 0,
          Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1,
        );

        return m.multiplyVector2(p);
      },

    },

    init: function () { },
  });
});

phina.namespace(() => {

  const SPEED = 18;

  phina.define("ShotBullet", {
    superClass: "GLSprite",

    init: function (params) {
      this.superInit({
        spriteArray: params.spriteArray,
        image: "black.png",
      });

      this.power = 1;
      this.r = 1;

      this.beforePosition = Vector2(0, 0);
      this.velocity = Vector2(0, 0);
    },

    setAngle: function (rad) {
      this.velocity.fromAngle(rad, SPEED);
      this.rotation = rad.toDegree() + 90;
      return this;
    },

    update: function () {
      this.beforePosition.set(this.x, this.y);
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      if (this.x < 0 || CANVAS_WIDTH <= this.x || this.y < 0 || CANVAS_HEIGHT <= this.y) {
        this.remove();
      }
    },

    hit: function () {
      this.remove();
    },

    _accessor: {
      a: {
        get: function () {
          return this.beforePosition;
        },
      },
      b: {
        get: function () {
          return this.position;
        },
      },
      left: {
        get: function () {
          return Math.min(this.a.x, this.b.x);
        },
        set: function () { },
      },
      right: {
        get: function () {
          return Math.max(this.a.x, this.b.x);
        },
        set: function () { },
      },
      top: {
        get: function () {
          return Math.min(this.a.y, this.b.y);
        },
        set: function () { },
      },
      bottom: {
        get: function () {
          return Math.max(this.a.y, this.b.y);
        },
        set: function () { },
      },
    },
  });
});

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

phina.namespace(() => {

  phina.define("TiledAsset", {
    superClass: "phina.asset.Asset",

    init: function () {
      this.superInit();
      this.tilesets = null;
    },

    _load: function (resolve) {
      const src = this.src.startsWith("/") ? this.src : "./" + this.src;
      const basePath = src.substring(0, src.lastIndexOf("/") + 1);
      fetch(src)
        .then(res => res.json())
        .then(json => {
          this.json = json;
          Promise.all(
            json.tilesets.map((ts, id) => Tileset(id, ts).load(basePath + ts.source))
          ).then(tilesets => {
            this.tilesets = tilesets;
            resolve(this);
          });
        });
    },
  });

  phina.define("Tileset", {
    init: function (id, tileset) {
      this.id = id;
      this.image = null;
      this.normalImage = null;
      this.emissionImage = null;
      this.firstgid = tileset.firstgid;
      this.source = tileset.source;

      this.json = null;
      this.tilewidth = 0;
      this.tileheight = 0;
      this.imagewidth = 0;
      this.imageheight = 0;
      this.cols = 0;
      this.rows = 0;
    },

    load: function (path) {
      return new Promise(resolve => {
        fetch(path).then(res => res.json()).then(json => {
          this.json = json;
          this.setup();
          if (json.image) {
            const _path = path.startsWith("/") ? path : "./" + path;
            const basePath = _path.substring(0, _path.lastIndexOf("/") + 1);
            Flow.resolve()
              .then(() => {
                this.image = phina.asset.Texture();
                return this.image.load(basePath + json.image);
              })
              .then(() => {
                const filename = json.image.replace(".png", "_n.png");
                this.normalImage = phina.asset.Texture();
                return this.normalImage.load(basePath + filename);
              })
              .then(() => {
                const filename = json.image.replace(".png", "_e.png");
                this.emissionImage = phina.asset.Texture();
                return this.emissionImage.load(basePath + filename);
              })
              .then(() => {
                if (json.transparentcolor) {
                  this.procTransparent(json.transparentcolor);
                }
              })
              .then(() => resolve(this));
          } else {
            resolve(this);
          }
        });
      });
    },

    procTransparent: function (transparentcolor) {
      const r = Number("0x" + transparentcolor.substring(1, 3));
      const g = Number("0x" + transparentcolor.substring(3, 5));
      const b = Number("0x" + transparentcolor.substring(5, 7));

      const img = this.image.domElement;
      const canvas = phina.graphics.Canvas().setSize(img.width, img.height);
      canvas.context.drawImage(img, 0, 0);
      const imgData = canvas.context.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 0] == r && data[i + 1] == g && data[i + 2] == b) {
          data[i + 0] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
      canvas.context.putImageData(imgData, 0, 0);

      this.image = canvas;
    },

    setup: function () {
      this.tilewidth = this.json.tilewidth;
      this.tileheight = this.json.tileheight;
      this.imagewidth = this.json.imagewidth;
      this.imageheight = this.json.imageheight;
      this.cols = this.imagewidth / this.json.tilewidth;
      this.rows = this.imageheight / this.json.tileheight;
    },

    calcUv: function (cell) {
      const w = this.tilewidth / this.imagewidth;
      const h = this.tileheight / this.imageheight;

      const index = cell - this.firstgid;
      const u0 = (index % this.cols) * w;
      const u1 = u0 + w;
      const v0 = Math.floor(index / this.cols) * h;
      const v1 = v0 + h;

      return [
        u0, v1,
        u1, v1,
        u0, v0,
        u1, v0,
      ];
    },
  });

  phina.asset.AssetLoader.register('tiled', function (key, src) {
    var asset = TiledAsset();
    return asset.load(src);
  });

});

phina.namespace(() => {

  let TEXTURE = null;

  phina.define("Middle1", {
    superClass: "Enemy",

    init: function (params) {
      this.superInit(({}).$extend({}, params));

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(3, 4444);

      this.hp = 15;
      this.r = 30;
      this.toX = params.toX + CANVAS_WIDTH * 0.5;

      this.fromJSON({
        children: {
          body: {
            className: "Sprite",
            arguments: [TEXTURE],
          },
        },
      });

      this.on("enter", () => this.flare("attack"));

      this.on("killed", () => {
        this.flare("effect", { type: "middleExplosion" });
      });
    },

    start: function () {
      this.tweener
        .clear()
        .to({
          x: this.toX,
        }, 2000, "easeOutQuad");

      this.on("enterframe", () => {
        this.y += 1.2;

        if (Fighter.instance.y < this.y) {
          this.pauseAttack();
        } else {
          this.resumeAttack();
        }

        if (this.entered && !this.inWorld()) {
          this.remove();
        }
      });
    },
  });

});

phina.namespace(() => {

  let TEXTURE = null;

  phina.define("TankSmall", {
    superClass: "Enemy",

    init: function (params) {
      params = ({}).$extend({
        speed: 0.75,
      }, params);
      this.superInit(params);

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(2, 3333);

      this.hp = 8;
      this.r = 20;
      this.type = "ground";
      this.vx = Math.cos(params.direction) * params.speed;
      this.vy = Math.sin(params.direction) * params.speed;
      this.rotation = 90 + params.direction.toDegree();

      this.fromJSON({
        children: {
          body: {
            className: "Sprite",
            arguments: [TEXTURE],
          },
        },
      });

      this.on("enter", () => this.flare("attack"));
      this.on("killed", () => {
        this.flare("effect", { type: "smallExplosion" });
      });
    },

    start: function () {
      this.on("enterframe", () => {
        this.x += this.vx;
        this.y += this.vy;

        if (this.entered && !this.inWorld) {
          this.remove();
        }
      });
    },
  });
});

phina.namespace(() => {

  let TEXTURE = null;

  phina.define("Zako1", {
    superClass: "Enemy",

    init: function (params) {
      this.superInit(({}).$extend({}, params));

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(2, 1111);

      this.hp = 3;
      this.r = 20;

      this.fromJSON({
        children: {
          body: {
            className: "AtlasSprite",
            arguments: {
              atlas: "enemies",
              frame: "heri1_1.png",
            },
          },
        },
      });

      this.on("killed", () => {
        this.flare("effect", { type: "smallExplosion" });
      });
    },

    start: function () {
      this.tweener
        .clear()
        .by({
          y: 500
        }, 1500, "easeOutQuad")
        .call(() => this.flare("attack"))
        .wait(1000)
        .by({
          y: -500
        }, 1500, "easeInQuad")
        .call(() => this.remove());

      this.odd = true;
      this.on("enterframe", (e) => {
        this.body.scaleX = Fighter.instance.x < this.x ? 1 : -1;
        if (this.odd) {
          this.body.setFrame("heri1_1.png");
        } else {
          this.body.setFrame("heri1_2.png");
        }
        this.odd = !this.odd;
      });
    },
  });

});

phina.namespace(() => {

  let TEXTURE = null;

  phina.define("Zako2", {
    superClass: "Enemy",

    init: function (params) {
      this.superInit(({}).$extend({}, params));

      if (TEXTURE == null) TEXTURE = ShipTextureGenerator.gen(2, 2222);

      this.hp = 3;
      this.r = 20;
      this.a = Vector2(0, 0);
      this.v = Vector2(0, 3);

      this.fromJSON({
        children: {
          body: {
            className: "Sprite",
            arguments: [TEXTURE],
          },
        },
      });

      this.on("enter", () => this.flare("attack"));

      this.on("killed", () => {
        this.flare("effect", { type: "smallExplosion" });
      });
    },

    start: function () {
      this.on("enterframe", () => {
        this.a.set(Fighter.instance.x - this.x, Fighter.instance.y - this.y).normalize();
        const angle = this.a.toDegree();
        if (180 <= angle && angle < 270) {
          this.a.fromDegree(180);
        } else if (270 <= angle && angle < 360) {
          this.a.fromDegree(0);
        }
        this.v.add(this.a.mul(0.3)).normalize().mul(7);

        this.position.add(this.v);
        this.rotation = 90 + angle;

        if (Fighter.instance.y < this.y) {
          this.pauseAttack();
        } else {
          this.resumeAttack();
        }

        if (this.entered && !this.inWorld()) {
          this.remove();
        }
      });
    },

  });

});

phina.namespace(() => {

  phina.define("GLApp", {
    superClass: "phina.display.DomApp",

    gl: null,

    init: function (params) {
      params = ({}).$extend(GLApp.defaults, params);
      if (!params.query && !params.domElement) {
        params.domElement = document.createElement('canvas');
        if (params.append) {
          document.body.appendChild(params.domElement);
        }
      }

      this.superInit(params);

      this.domElement.width = params.width;
      this.domElement.height = params.height;

      if (params.fit) {
        FitScreen.fit(this.domElement);
      }

      this.gl = this.domElement.getContext("webgl");
      const ext = this.gl.getExtension("OES_texture_float");
      this.renderer = GLAppRenderer(this.gl);
    },

    _draw: function () {
      const gl = this.gl;

      this.renderer.render(this.currentScene);
      gl.flush();
    },

    _static: {
      defaults: {
        width: 640,
        height: 960,
        fit: true,
        append: true,
        fps: 60,
      },
    },
  });

});

phina.namespace(() => {

  phina.define("GLAppRenderer", {
    superClass: "phina.util.EventDispatcher",

    gl: null,
    lighting: null,

    init: function (gl, w, h) {
      this.superInit();

      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1.0);

      this.gl = gl;
      this.spriteArrays = {};
      this.lighting = Lighting();
    },

    addSpriteArray: function (name, atlas, max = 1000) {
      const array = GLSpriteArray(this.gl, atlas, max);
      this.spriteArrays[name] = array;
      return array;
    },

    getSpriteArray: function (name) {
      return this.spriteArrays[name];
    },

    render: function (scene) {
      const gl = this.gl;

      this.flare("prerender", { gl });

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (let name in this.spriteArrays) {
        const array = this.spriteArrays[name];
        array.draw(gl, this.lighting);
      }
      this.renderChildren(scene);

      this.flare("postrender", { gl, scene });
    },

    renderChildren: function (obj) {
      if (obj.children.length > 0) {
        let tempChildren = obj.children.slice();
        for (let i = 0, len = tempChildren.length; i < len; ++i) {
          this.renderObject(tempChildren[i]);
        }
      }
    },

    renderObject: function (obj) {
      if (obj.visible === false) return;

      obj._calcWorldMatrix && obj._calcWorldMatrix();
      obj._calcWorldAlpha && obj._calcWorldAlpha();

      obj.draw && obj.draw(this.gl, this.lighting);

      let tempChildren = obj.children.slice();
      for (let i = 0, len = tempChildren.length; i < len; ++i) {
        this.renderObject(tempChildren[i]);
      }
    },

    addNext: function (pass) {
      pass.setRenderer(this);
      return pass;
    },

  });

});

phina.namespace(() => {

  phina.define("GLLoadingScene", {
    superClass: "GLScene",

    init: function (params) {
      this.superInit(params);

      const loader = phina.asset.AssetLoader();
      loader.on("load", () => {
        this.app.popScene();
      });
      loader.load(params.assets);
    },
  });

});

phina.namespace(() => {

  phina.define("GLScene", {
    superClass: "phina.app.Scene",

    init: function (params) {
      this.superInit();
      params = ({}).$extend(GLScene.defaults, params);
    },

    _static: {
      defaults: {
      },
    },
  });

});

phina.namespace(() => {
  /**
   * „Ç§„É≥„Çπ„Çø„É≥„Ç∑„É≥„Ç∞„Çí‰Ωø„Çè„Å™„ÅÑ„ÇÑ„Å§
   */
  phina.define("GLSingleSprite", {

    superClass: "DisplayElement",

    z: 0,

    init: function (options) {
      options = ({}).$extend(GLSingleSprite.defaults, options);
      this.superInit(options);

      let image = null;
      if (typeof (options.image) == "string") {
        image = AssetManager.get("image", options.image);
      } else {
        image = options.image;
      }

      this.width = image.domElement.width;
      this.height = image.domElement.height;

      this.depthEnabled = options.depthEnabled;
      this.blendMode = options.blendMode;
      this.alphaEnabled = options.alphaEnabled;
      this.brightness = options.brightness;

      const gl = options.gl;
      if (typeof (options.image) == "string") {
        this.texture = TextureAsset.get(gl, options.image);
        this.normalMap = TextureAsset.get(gl, options.image + "_n");
        this.emissionMap = TextureAsset.get(gl, options.image + "_e");
      } else {
        this.texture = options.image;
        this.normalMap = options.normalMap;
        this.emissionMap = options.emissionMap;
      }
      if (this.normalMap == null) {
        this.normalMap = TextureAsset.get(gl, GLSingleSprite.defaults.normalMap);
      }
      if (this.emissionMap == null) {
        this.emissionMap = TextureAsset.get(gl, GLSingleSprite.defaults.emissionMap);
      }

      if (GLSingleSprite.drawable == null) {
        const program = phigl.Program(gl)
          .attach("glsinglesprite.vs")
          .attach("glsinglesprite.fs")
          .link();
        GLSingleSprite.drawable = phigl.Drawable(gl)
          .setProgram(program)
          .setIndexValues([0, 1, 2, 1, 3, 2])
          .declareAttributes("position", "uv")
          .setAttributeDataArray([{
            unitSize: 2,
            data: [
              0, 1,
              1, 1,
              0, 0,
              1, 0,
            ]
          }, {
            unitSize: 2,
            data: [
              0, 1,
              1, 1,
              0, 0,
              1, 0,
            ],
          },])
          .createVao()
          .declareUniforms(
            "instanceActive",
            "instancePosition",
            "instanceSize",
            "instanceAlphaEnabled",
            "instanceAlpha",
            "instanceBrightness",
            "cameraMatrix0",
            "cameraMatrix1",
            "cameraMatrix2",
            "screenSize",
            "texture",
            "texture_n",
            "texture_e",
            "ambientColor",
            "lightColor",
            "lightPower",
            "lightPosition",
          );
      }
    },

    setZ: function (v) {
      this.z = v;
      return this;
    },

    draw: function (gl, lighting) {
      const drawable = GLSingleSprite.drawable;

      if (this.blendMode === "source-over") {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }

      if (this.blendMode === "source-over") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
      }

      const m = this._worldMatrix;
      const uni = drawable.uniforms;
      uni["instanceActive"].setValue((this.parent && this.visible) ? 1 : 0);
      if (this.parent && this.visible) {
        uni["instancePosition"].setValue([-this.width * this.originX, -this.height * this.originY, this.z]);
        uni["instanceSize"].setValue([this.width, this.height]);
        uni["cameraMatrix0"].setValue([m.m00, m.m10]);
        uni["cameraMatrix1"].setValue([m.m01, m.m11]);
        uni["cameraMatrix2"].setValue([m.m02, m.m12]);
        uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
        uni["texture"].setValue(0).setTexture(this.texture);
        uni["texture_n"].setValue(1).setTexture(this.normalMap);
        uni["texture_e"].setValue(2).setTexture(this.emissionMap);
        uni["alphaEnabled"].setValue(this.alphaEnabled ? 1 : 0);
        uni["alpha"].setValue(this._worldAlpha);
        uni["brightness"].setValue(this.brightness);
        lighting.set(drawable);
      }

      drawable.draw();
    },

    _static: {
      defaults: {
        depthEnabled: true,
        blendMode: "source-over",
        alphaEnabled: false,
        brightness: 1.0,
        normalMap: "no_normal",
        emissionMap: "black",
      },
      drawable: null,
    },
  });

});

phina.namespace(() => {

  phina.define("GLSpriteArray", {

    init: function (gl, atlas, max, options) {
      options = ({}).$extend(GLSpriteArray.defaults, options);

      this.gl = gl;
      this.indexPool = Array.range(0, max);
      this.instances = [];

      this.atlas = phina.asset.AssetManager.get("atlas", atlas);

      this.image = this.atlas.images[Object.keys(this.atlas.images)[0]];
      this.texture = phigl.Texture(gl, this.image);
      this.max = max;

      this.depthEnabled = options.depthEnabled;
      this.blendMode = options.blendMode;

      if (GLSpriteArray.drawable == null) {
        const ext = phigl.Extensions.getInstancedArrays(gl);

        const program = phigl.Program(gl)
          .attach("glsprite.vs")
          .attach("glsprite.fs")
          .link();

        GLSpriteArray.drawable = phigl.InstancedDrawable(gl, ext)
          .setProgram(program)
          .setIndexValues([0, 1, 2, 1, 3, 2])
          .declareAttributes("posuv")
          .setAttributeDataArray([{
            // position, uv
            unitSize: 2,
            data: [
              0, 1,
              1, 1,
              0, 0,
              1, 0,
            ],
          },])
          .createVao()
          .declareInstanceAttributes(
            "instanceUvMatrix0",
            "instanceUvMatrix1",
            "instanceUvMatrixN0",
            "instanceUvMatrixN1",
            "instanceUvMatrixE0",
            "instanceUvMatrixE1",
            "instancePosition",
            "instanceSize",
            "cameraMatrix0",
            "cameraMatrix1",
            "color",
          )
          .declareUniforms(
            "screenSize",
            "texture",
            "alphaEnabled",
            "ambientColor",
            "lightColor",
            "lightPower",
            "lightPosition",
          );
      }

      this.array = [];
      for (let i = 0; i < max; i++) {
        this.array.push(...[
          // uv matrix
          1, 0,
          0, 1,
          0, 0,
          // uv matrix normal
          1, 0,
          0, 1,
          0, 0,
          // // uv matrix emission
          1, 0,
          0, 1,
          0, 0,
          // sprite position
          0, 0, 0,
          // sprite size ( + active + alpha)
          0, 0, 0, 1,
          // camera matrix
          1, 0,
          0, 1,
          0, 0,
          // color
          1, 1, 1,
        ]);
      }
    },

    draw: function (gl, lighting) {
      const drawable = GLSpriteArray.drawable;

      if (this.blendMode === "source-over") {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }

      if (this.blendMode === "source-over") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
      }

      for (let i = 0, len = this.instances.length; i < len; i++) {
        this.instances[i].updateAttributes(this.array);
      }

      const uni = drawable.uniforms;
      uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
      uni["texture"].setValue(0).setTexture(this.texture);
      uni["alphaEnabled"].setValue(this.blendMode == "source-over" ? 0 : 1);
      lighting.set(drawable);

      drawable.setInstanceAttributeData(this.array);
      drawable.draw(this.max);
    },

    dispose: function () {

    },

    _static: {
      defaults: {
        depthEnabled: true,
        blendMode: "source-over",
      },
      drawable: null,
    },
  });

  phina.define("GLSprite", {
    superClass: "phina.display.DisplayElement",

    init: function (params) {
      params = ({}).$extend(GLSprite.defaults, params);
      this.superInit(params);

      this.spriteArray = params.spriteArray;
      this.alphaEnabled = params.alphaEnabled;
      this.brightness = params.brightness;
      if (this.alphaEnabled) {
        this.instanceIndex = this.spriteArray.indexPool.pop();
      } else {
        this.instanceIndex = this.spriteArray.indexPool.shift();
      }
      this.uvMatrix = Matrix33();
      this.uvMatrixN = Matrix33();
      this.uvMatrixE = Matrix33();

      this.setImage(params.image);
      this.setNormalMap(params.normalMap);
      this.setEmissionMap(params.emissionMap);

      this.spriteArray.instances.push(this);

      this.z = 0;
      this.r = 1;
      this.g = 1;
      this.b = 1;
    },

    setImage: function (image) {
      const frame = this.spriteArray.atlas.getFrameByName(image);
      const imgW = this.spriteArray.image.domElement.width;
      const imgH = this.spriteArray.image.domElement.height;

      const f = frame.frame;
      const texX = f.x;
      const texY = f.y;
      const texW = f.w;
      const texH = f.h;

      const uvm = this.uvMatrix;
      uvm.m00 = texW / imgW;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / imgH;
      uvm.m02 = texX / imgW;
      uvm.m12 = texY / imgH;

      this.width = f.w;
      this.height = f.h;
    },

    setNormalMap: function (image) {
      const frame = this.spriteArray.atlas.getFrameByName(image);
      const imgW = this.spriteArray.image.domElement.width;
      const imgH = this.spriteArray.image.domElement.height;

      const f = frame.frame;
      const texX = f.x;
      const texY = f.y;
      const texW = f.w;
      const texH = f.h;

      const uvm = this.uvMatrixN;
      uvm.m00 = texW / imgW;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / imgH;
      uvm.m02 = texX / imgW;
      uvm.m12 = texY / imgH;
    },

    setEmissionMap: function (image) {
      const frame = this.spriteArray.atlas.getFrameByName(image);
      const imgW = this.spriteArray.image.domElement.width;
      const imgH = this.spriteArray.image.domElement.height;

      const f = frame.frame;
      const texX = f.x;
      const texY = f.y;
      const texW = f.w;
      const texH = f.h;

      const uvm = this.uvMatrixE;
      uvm.m00 = texW / imgW;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / imgH;
      uvm.m02 = texX / imgW;
      uvm.m12 = texY / imgH;
    },

    setZ: function (v) {
      this.z = v;
      return this;
    },

    setAlpha: function (v) {
      this.alpha = v;
      return this;
    },

    setBrightness: function (v) {
      this.brightness = v;
      return this;
    },

    dispose: function () {
      if (this.alphaEnabled) {
        this.spriteArray.indexPool.push(this.instanceIndex);
      } else {
        this.spriteArray.indexPool.unshift(this.instanceIndex);
      }
      this.spriteArray.instances.erase(this);
      this.instanceIndex = undefined;
    },

    updateAttributes: function (array) {
      if (this.instanceIndex === undefined) return;

      const idx = this.instanceIndex;
      const uvm = this.uvMatrix;
      const uvmN = this.uvMatrixN;
      const uvmE = this.uvMatrixE;
      const m = this._worldMatrix;

      const size = 34;

      // active
      array[idx * size + 23] = (this.parent && this.visible) ? 1 : 0;
      if (this.parent && this.visible) {
        // uv matrix
        array[idx * size + 0] = uvm.m00;
        array[idx * size + 1] = uvm.m10;
        array[idx * size + 2] = uvm.m01;
        array[idx * size + 3] = uvm.m11;
        array[idx * size + 4] = uvm.m02;
        array[idx * size + 5] = uvm.m12;
        // uv matrix normal
        array[idx * size + 6] = uvmN.m00;
        array[idx * size + 7] = uvmN.m10;
        array[idx * size + 8] = uvmN.m01;
        array[idx * size + 9] = uvmN.m11;
        array[idx * size + 10] = uvmN.m02;
        array[idx * size + 11] = uvmN.m12;
        // // uv matrix emission
        array[idx * size + 12] = uvmE.m00;
        array[idx * size + 13] = uvmE.m10;
        array[idx * size + 14] = uvmE.m01;
        array[idx * size + 15] = uvmE.m11;
        array[idx * size + 16] = uvmE.m02;
        array[idx * size + 17] = uvmE.m12;
        // sprite position
        array[idx * size + 18] = -this.width * this.originX;
        array[idx * size + 19] = -this.height * this.originY;
        array[idx * size + 20] = this.z;
        // sprite size
        array[idx * size + 21] = this.width;
        array[idx * size + 22] = this.height;
        // alpha
        array[idx * size + 24] = this._worldAlpha;
        // camera matrix
        array[idx * size + 25] = m.m00;
        array[idx * size + 26] = m.m10;
        array[idx * size + 27] = m.m01;
        array[idx * size + 28] = m.m11;
        array[idx * size + 29] = m.m02;
        array[idx * size + 30] = m.m12;
        // color
        array[idx * size + 31] = this.r;
        array[idx * size + 32] = this.g;
        array[idx * size + 33] = this.b;
      }
    },

    _static: {
      defaults: {
        alphaEnabled: false,
        normalMap: "no_normal.png",
        emissionMap: "black.png"
      },
    },
  });

});

phina.namespace(() => {

  phina.define("GLTiledMap", {
    superClass: "DisplayElement",

    z: 0,

    init: function (options) {
      options = ({}).$extend(GLTiledMap.defaults, options);
      this.superInit(options);

      this.blendMode = options.blendMode;

      const gl = options.gl;

      if (typeof (options.tiledAsset) == "string") {
        this.tiledAsset = AssetManager.get("tiled", options.tiledAsset);
      } else {
        this.tiledAsset = options.tiledAsset;
      }

      const tilesets = this.tiledAsset.tilesets;
      this.textures = tilesets.map(ts => TextureAsset.get(gl, ts.image));
      this.normalMaps = tilesets.map(ts => TextureAsset.get(gl, ts.normalImage));
      this.emissionMaps = tilesets.map(ts => TextureAsset.get(gl, ts.emissionImage));

      const cols = this.tiledAsset.json.width;
      const rows = this.tiledAsset.json.height;
      this.tilewidth = this.tiledAsset.json.tilewidth;
      this.tileheight = this.tiledAsset.json.tileheight;

      this.width = cols * this.tilewidth;
      this.height = rows * this.tileheight;
      this.originX = 0;
      this.originY = 0;

      const indices = [];
      const positions = [];
      const textureIndices = [];
      const uvs = [];

      let offset = 0;
      this.tiledAsset.json.layers.filter(l => l.type == "tilelayer").reverse().forEach((layer, layerIndex) => {
        const data = layer.data;

        tilesets.push({ firstgid: Number.MAX_VALUE });
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            const cell = data[idx];

            if (cell == 0) continue;

            const textureIndex = tilesets.indexOf(tilesets.find(ts => cell < ts.firstgid)) - 1;
            const uv = tilesets[textureIndex].calcUv(cell);

            indices.push(
              offset + 0,
              offset + 1,
              offset + 2,
              offset + 1,
              offset + 3,
              offset + 2,
            );
            positions.push(
              x + 0, y + 1, layerIndex * -0.01,
              x + 1, y + 1, layerIndex * -0.01,
              x + 0, y + 0, layerIndex * -0.01,
              x + 1, y + 0, layerIndex * -0.01,
            );
            offset += 4;
            textureIndices.push(
              textureIndex,
              textureIndex,
              textureIndex,
              textureIndex,
            );
            uvs.push(...uv);
          }
        }
        tilesets.pop();
      });

      if (GLTiledMap.program == null) {
        GLTiledMap.program = phigl.Program(gl)
          .attach("gltiledmap.vs")
          .attach("gltiledmap.fs")
          .link();
      }
      this.drawable = phigl.Drawable(gl)
        .setProgram(GLTiledMap.program)
        .setIndexValues(indices)
        .declareAttributes("position", "uv", "textureIndex")
        .setAttributeDataArray([{
          unitSize: 3,
          data: positions,
        }, {
          unitSize: 2,
          data: uvs,
        }, {
          unitSize: 1,
          data: textureIndices,
        }])
        .createVao()
        .declareUniforms(
          "instanceActive",
          "instancePosition",
          "instanceSize",
          "instanceAlpha",
          "cameraMatrix0",
          "cameraMatrix1",
          "cameraMatrix2",
          "screenSize",
          "texture",
          "texture_n",
          "texture_e",
          "ambientColor",
          "lightColor",
          "lightPower",
          "lightPosition",
        );
    },

    setZ: function (v) {
      this.z = v;
      return this;
    },

    draw: function (gl, lighting) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const m = this._worldMatrix;

      const drawable = this.drawable;
      const uni = drawable.uniforms;
      uni["instanceActive"].setValue((this.parent && this.visible) ? 1 : 0);
      if (this.parent && this.visible) {
        uni["instancePosition"].setValue([-this.width * this.originX, -this.height * this.originY, this.z]);
        uni["instanceSize"].setValue([this.tilewidth, this.tileheight]);
        uni["instanceAlpha"].setValue(this._worldAlpha);
        uni["cameraMatrix0"].setValue([m.m00, m.m10]);
        uni["cameraMatrix1"].setValue([m.m01, m.m11]);
        uni["cameraMatrix2"].setValue([m.m02, m.m12]);
        uni["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
        for (let i = 0, len = this.textures.length; i < len; i++) {
          uni[`texture[${i}]`].setValue(4 * 0 + i).setTexture(this.textures[i]);
        }
        for (let i = 0, len = this.normalMaps.length; i < len; i++) {
          uni[`texture_n[${i}]`].setValue(4 * 1 + i).setTexture(this.normalMaps[i]);
        }
        for (let i = 0, len = this.emissionMaps.length; i < len; i++) {
          uni[`texture_e[${i}]`].setValue(4 * 2 + i).setTexture(this.emissionMaps[i]);
        }
        lighting.set(drawable);
      }

      drawable.draw();
    },

    _static: {
      defaults: {
        layer: 0,
      },
      program: null,
    }
  });

});

phina.namespace(() => {

  const POINT_LIGHT_COUNT = 10;

  phina.define("Lighting", {

    r: 0,
    g: 0,
    b: 0,
    pointLights: null,

    init: function () {
      this.pointLights = Array.range(0, POINT_LIGHT_COUNT).map(index => {
        const pl = PointLight({ index });
        return pl;
      });
    },

    setColor: function (r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
      return this;
    },

    set: function (drawable) {
      drawable.uniforms["ambientColor"].setValue([this.r / 255, this.g / 255, this.b / 255, 1]);

      const ps = this.pointLights;
      for (let i = 0, len = ps.length; i < len; i++) {
        ps[i].set(drawable);
      }
    },

  });

});

phina.namespace(() => {

  phina.define("PointLight", {
    superClass: "DisplayElement",

    index: 0,
    z: 0,

    r: 0,
    g: 0,
    b: 0,
    power: 0,

    init: function (options) {
      options = ({}).$extend(PointLight.defaults, options);
      this.superInit(options);
      this.index = options.index;
      this.z = options.z;
    },

    setZ: function (value) {
      this.z = value;
      return this;
    },

    setPower: function (v) {
      this.power = v;
      return this;
    },

    setColor: function (r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
      return this;
    },

    set: function (drawable) {
      const uni = drawable.uniforms;
      const i = this.index;
      if (this.parent && this.visible) {
        uni[`lightColor[${i}]`].setValue([this.r / 255, this.g / 255, this.b / 255, 1]);
        uni[`lightPower[${i}]`].setValue(this.power);
        uni[`lightPosition[${i}]`].setValue([this.x, this.y, this.z]);
      } else {
        uni[`lightColor[${i}]`].setValue([0, 0, 0, 1]);
        uni[`lightPower[${i}]`].setValue(0);
        uni[`lightPosition[${i}]`].setValue([0, 0, 0]);
      }
    },

    _static: {
      defaults: {
        z: 30,
        power: 0,
      },
    },

  });

});

phina.namespace(() => {

  phina.define("TextureAsset", {
    _static: {
      get: function (gl, name) {
        const AssetManager = phina.asset.AssetManager;

        if (typeof(name) !== "string") {
          if (name._id) {
            name = name._id;
          } else {
            name._id = gen();
            AssetManager.set("image", name._id, name);
          }

          name = name._id;
        }

        if (AssetManager.get("texture", name) == null) {
          const img = AssetManager.get("image", name);
          if (img == null) {
            console.log("„Åù„Çì„Å™ÁîªÂÉè„Å™„ÅÑ„Åß„Åô " + name);
            return null;
          }
          AssetManager.set("texture", name, phigl.Texture(gl, img));
        }

        return AssetManager.get("texture", name);
      },
    },
  });

  const gen = () =>  Date.now() + "-" + phina.util.Random.randint(0, 1000) + "-" + phina.util.Random.randint(0, 1000) + "-" + phina.util.Random.randint(0, 1000);

});

phina.namespace(() => {

  phina.define("megaparticle.Emitter", {
    superClass: "phina.app.Object2D",

    init: function (json, particleSystem) {
      this.superInit();
      this.json = json;
      this.particleSystem = particleSystem;

      this.indices = particleSystem.getIndices(json.maxParticles);
    },

    start: function (x, y) {
      this.particleSystem.start(x, y, this.indices, this.json);
    },

    stop: function () {
      this.particleSystem.reserveStop(this.indices);
    },

  });

});

phina.namespace(() => {

  const texSize = 1024;
  const posX = x => (-texSize / 2 + (x * 4 + 2)) / (texSize / 2);
  const posY = y => (texSize / 2 - (y * 4 + 2)) / (texSize / 2);
  const uvX = x => x * 4 / texSize;
  const uvY = y => 1 - y * 4 / texSize;

  phina.define("megaparticle.ParticleSystem", {
    _static: {
      texSize: texSize,
    },

    init: function ({ gl }) {
      if (gl.getExtension("OES_texture_float") == null) throw "Float Texture„Å´ÂØæÂøú„Åó„Å¶„Å™„ÅÑ„Çâ„Åó„ÅÑ„Çà";
      if (gl.getExtension("WEBGL_color_buffer_float") == null) throw "Float Texture„Å´ÂØæÂøú„Åó„Å¶„Å™„ÅÑ„Çâ„Åó„ÅÑ„Çà";

      this.gl = gl;
      this.time = 0;

      this.framebufferA = phigl.FloatTexFramebuffer(gl, texSize, texSize);
      this.framebufferB = phigl.FloatTexFramebuffer(gl, texSize, texSize);
      this.textures = {};
      this.textureNames = [];
      this.reservedStopIndices = [];
      this.velocityUpdateTime = 0;

      this._setupStarter();
      this._setupStoper();
      this._setupUpdater();
      this._setupDrawer();

      this._setupCopy();
      this._setupSet();

      this.indices = Array.range(0, (texSize / 4) * (texSize / 4)).map(index => {
        return { index, releaseAt: -1 };
      });

      this.freeIndex = 0;
    },

    delete: function () {
      this.framebufferA.delete();
      this.framebufferB.delete();
      this.drawableStart.delete();
      this.drawableStop.delete();
      this.drawableUpdate.delete();
      this.drawableDraw.delete();
      this.drawableSet.delete();
      this.drawableCopy.delete();
      this.textureNames.forEach(name => this.textures[name].delete());
    },

    swapBuffer: function () {
      [this.framebufferA, this.framebufferB] = [this.framebufferB, this.framebufferA];
    },

    getIndices: function (count) {
      const max = (texSize / 4) * (texSize / 4);
      const start = this.freeIndex;
      this.freeIndex += count;
      if (start + count < max) {
        return Array.range(start, start + count);
      } else {
        throw `„Éë„Éº„ÉÜ„Ç£„ÇØ„É´„Åü„Çä„Å™„ÅÑ„Çà (Ë¶ÅÊ±ÇÔºö${start + count}„ÄÅÊúÄÂ§ßÔºö${max})`;
      }
    },

    createEmitter: function (json) {
      return megaparticle.Emitter(json, this);
    },

    registerTexture: function (name, image) {
      if (this.textures[name] == null) {
        this.textures[name] = phigl.Texture(this.gl, image, (gl) => {
          // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        });
        this.textureNames.push(name);
      }
    },

    _setupStarter: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_start.vs")
        .attach("mega_start.fs")
        .link();
      this.drawableStart = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([])
        .declareAttributes("index")
        .setAttributeDataArray([{
          unitSize: 1,
          data: Array.range(0, (texSize / 4) * (texSize / 4)),
        }])
        .createVao()
        .declareUniforms(
          "texSize",
          "time",
          "data0",
          "data1",
          "data2",
          "randomFactor",
        )
        .setDrawMode(gl.POINTS);
    },

    start: function (x, y, indices, params) {
      const gl = this.gl;
      const emitInterval = params.particleLifespan / params.maxParticles;

      this.framebufferA.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const drawable = this.drawableStart;
      drawable.setIndexValues(indices);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["randomFactor0"].setValue([phina.util.Random.random(), phina.util.Random.random()]);
      drawable.uniforms["randomFactor1"].setValue([phina.util.Random.random(), phina.util.Random.random()]);
      drawable.uniforms["data0"].setValue([
        // [0]
        x,
        y,
        params.sourcePositionVariancex,
        params.sourcePositionVariancey,
        // [1]
        params.startParticleSize,
        params.startParticleSizeVariance,
        params.finishParticleSize,
        params.finishParticleSizeVariance,
        // [2]
        params.rotationStart,
        params.rotationStartVariance,
        params.rotationEnd,
        params.rotationEndVariance,
        // [3]
        params.startColorRed,
        params.startColorVarianceRed,
        params.finishColorRed,
        params.finishColorVarianceRed,
      ]);
      drawable.uniforms["data1"].setValue([
        // [0]
        params.startColorGreen,
        params.startColorVarianceGreen,
        params.finishColorGreen,
        params.finishColorVarianceGreen,
        // [1]
        params.startColorBlue,
        params.startColorVarianceBlue,
        params.finishColorBlue,
        params.finishColorVarianceBlue,
        // [2]
        params.startColorAlpha,
        params.startColorVarianceAlpha,
        params.finishColorAlpha,
        params.finishColorVarianceAlpha,
        // [3]
        params.angle,
        params.angleVariance,
        params.speed,
        params.speedVariance,
      ]);
      drawable.uniforms["data2"].setValue([
        // [0]
        params.gravityx,
        params.gravityy,
        params.radialAcceleration,
        params.radialAccelVariance,
        // [1]
        params.tangentialAcceleration,
        params.tangentialAccelVariance,
        params.particleLifespan,
        params.particleLifespanVariance,
        // [2]
        this.textureNames.indexOf(params.textureFileName),
        0,
        params.duration < 0 ? 1.0 : 0.0,
        emitInterval,
        // [3]
        indices[0],
        0,
        0,
        0,
      ]);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);
    },

    _setupStoper: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_stop.vs")
        .attach("mega_stop.fs")
        .link();
      const positions = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        positions.push(...[
          posX(x), posY(y)
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
        ]);
      }
      this.drawableStop = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([])
        .declareAttributes("position", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions,
        }, {
          unitSize: 2,
          data: dataUvs
        }])
        // .createVao()
        .declareUniforms(
          "texture",
          "texSize",
        )
        .setDrawMode(gl.POINTS);
    },

    reserveStop: function (indices) {
      this.reservedStopIndices.push(...indices);
    },

    execStop: function () {
      if (this.reservedStopIndices.length == 0) return;

      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const drawable = this.drawableStop;
      drawable.setIndexValues(this.reservedStopIndices);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();
      this.copy();

      this.reservedStopIndices.clear();
    },

    _setupUpdater: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_update.vs")
        .attach("mega_update.fs")
        .link();
      const indices = [];
      const positions = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        indices.push(index);
        positions.push(...[
          posX(x), posY(y)
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
        ]);
      }
      this.drawableUpdate = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(indices)
        .declareAttributes("position", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions
        }, {
          unitSize: 2,
          data: dataUvs
        }])
        .createVao()
        .declareUniforms(
          "texture",
          "texSize",
          "time",
          "deltaTime",
          "deltaPosition",
          "updateVelocity",
        )
        .setDrawMode(gl.POINTS);
    },

    update: function (deltaPosition = [0, 0], deltaSec = 0.0166) { // 0.0166 = 1 / 60
      this.execStop();

      this.time += deltaSec;
      this.velocityUpdateTime -= deltaSec;

      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const drawable = this.drawableUpdate;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["deltaTime"].setValue(deltaSec);
      drawable.uniforms["deltaPosition"].setValue(deltaPosition);
      drawable.uniforms["updateVelocity"].setValue(true);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();

      if (this.velocityUpdateTime <= 0) {
        this.velocityUpdateTime = 1 / 10;
      }
    },

    _setupDrawer: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_draw.vs")
        .attach("mega_draw.fs")
        .link();
      const indices = [];
      const positions = [];
      const uvs = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        indices.push(...[
          index * 4 + 0, index * 4 + 1, index * 4 + 2,
          index * 4 + 1, index * 4 + 3, index * 4 + 2,
        ]);
        positions.push(...[
          -0.5, 0.5,
          0.5, 0.5,
          -0.5, -0.5,
          0.5, -0.5,
        ]);
        uvs.push(...[
          0, 1,
          1, 1,
          0, 0,
          1, 0,
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
          uvX(x), uvY(y),
          uvX(x), uvY(y),
          uvX(x), uvY(y),
        ]);
      }
      this.drawableDraw = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(indices)
        .declareAttributes("position", "uv", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions,
        }, {
          unitSize: 2,
          data: uvs,
        }, {
          unitSize: 2,
          data: dataUvs,
        }])
        .createVao()
        .declareUniforms(
          "texture",
          "texSize",
          "time",
          "screenSize",
          "particleTexture0",
          "particleTexture1",
          "particleTexture2",
          "particleTexture3",
          "particleTexture4",
          "particleTexture5",
          "particleTexture6",
          "particleTexture7",
        )
        .setDrawMode(gl.TRIANGLES);
    },

    draw: function (canvasWidth, canvasHeight) {
      const gl = this.gl;

      gl.disable(gl.CULL_FACE);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      // gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      const drawable = this.drawableDraw;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.uniforms["time"].setValue(this.time);
      drawable.uniforms["screenSize"].setValue([canvasWidth, canvasHeight]);
      for (let i = 0, len = this.textureNames.length; i < len; i++) {
        drawable.uniforms["particleTexture" + i].setValue(1 + i).setTexture(this.textures[this.textureNames[i]]);
      }
      for (let i = this.textureNames.length; i < 8; i++) {
        drawable.uniforms["particleTexture" + i].setValue(1 + i).setTexture(this.textures[this.textureNames[0]]);
      }
      drawable.draw();
    },

    _setupSet: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_set.vs")
        .attach("mega_set.fs")
        .link();
      this.drawableSet = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0])
        .createVao()
        .declareUniforms(
          "position",
          "section0",
          "section1",
          "section2",
          "section3",
          "section4",
          "section5",
          "section6",
          "section7",
          "section8",
          "section9",
          "section10",
          "section11",
          "section12",
          "section13",
          "section14",
          "section15",
        )
        .setDrawMode(gl.POINTS);
    },

    set: function (params) {
      const gl = this.gl;

      this.framebufferA.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      const drawable = this.drawableSet;
      const x = params.index % (texSize / 4);
      const y = Math.floor(params.index / (texSize / 4));
      drawable.uniforms["position"].setValue([posX(x), posY(y)]);
      drawable.uniforms["section0"].setValue(params.section0 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section1"].setValue(params.section1 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section2"].setValue(params.section2 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section3"].setValue(params.section3 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section4"].setValue(params.section4 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section5"].setValue(params.section5 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section6"].setValue(params.section6 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section7"].setValue(params.section7 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section8"].setValue(params.section8 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section9"].setValue(params.section9 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section10"].setValue(params.section10 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section11"].setValue(params.section11 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section12"].setValue(params.section12 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section13"].setValue(params.section13 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section14"].setValue(params.section14 || [0.0, 0.0, 0.0, 0.0]);
      drawable.uniforms["section15"].setValue(params.section15 || [0.0, 0.0, 0.0, 0.0]);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);
    },

    _setupCopy: function () {
      const gl = this.gl;

      const program = phigl.Program(gl)
        .attach("mega_copy.vs")
        .attach("mega_copy.fs")
        .link();
      const indices = [];
      const positions = [];
      const dataUvs = [];
      const len = (texSize / 4) * (texSize / 4);
      for (let index = 0; index < len; index++) {
        const x = index % (texSize / 4);
        const y = Math.floor(index / (texSize / 4));
        indices.push(index);
        positions.push(...[
          posX(x), posY(y)
        ]);
        dataUvs.push(...[
          uvX(x), uvY(y),
        ]);
      }
      this.drawableCopy = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues(indices)
        .declareAttributes("position", "dataUv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: positions
        }, {
          unitSize: 2,
          data: dataUvs
        }])
        .createVao()
        .declareUniforms(
          "texture",
          "texSize",
        )
        .setDrawMode(gl.POINTS);
    },

    copy: function () {
      const gl = this.gl;

      this.framebufferB.bind(gl);
      gl.viewport(0, 0, texSize, texSize);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);

      const drawable = this.drawableCopy;
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.uniforms["texSize"].setValue(texSize);
      drawable.draw();
      phigl.FloatTexFramebuffer.unbind(gl);

      this.swapBuffer();
    },

    test: function () {
      const program = phigl.Program(gl)
        .attach("mega_test.vs")
        .attach("mega_test.fs")
        .link();
      const drawable = phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            -1, 1,
            1, 1,
            -1, -1,
            1, -1,
          ],
        }, {
          unitSize: 2,
          data: [
            0, 1,
            1, 1,
            0, 0,
            1, 0,
          ],
        }])
        .createVao()
        .declareUniforms(
          "texture",
        )
        .setDrawMode(gl.TRIANGLES);

      phigl.FloatTexFramebuffer.unbind(gl);
      gl.viewport(0, 0, 32, 32);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      drawable.uniforms["texture"].setValue(0).setTexture(this.framebufferA.texture);
      drawable.draw();

      console.log("test ok");
    },

  });

});

phina.namespace(function() {

  phina.define("phina.particle2dx.ColoredTexture", {
    superClass: "phina.graphics.Canvas",

    orig: null,

    r: -1,
    g: -1,
    b: -1,

    _textureName: null,
    _domElementBackup: null,

    init: function(options) {
      this.superInit();
      this.orig = phina.asset.AssetManager.get("image", options.textureName);
      this.setSize(this.orig.domElement.width, this.orig.domElement.height);

      this._textureName = options.textureName;

      this._canvasForCache = Array.range(0, 1000).map(function() {
        return phina.graphics.Canvas().setSize(this.width, this.height);
      }.bind(this));

      this.setColor(1.0, 1.0, 1.0);
    },

    setColor: function(r, g, b) {
      const nr = (~~(r * 256)) * 1;
      const ng = (~~(g * 256)) * 1;
      const nb = (~~(b * 256)) * 1;

      if (this.r === nr && this.g === ng && this.b === nb) return;

      this.r = nr;
      this.g = ng;
      this.b = nb;

      const key = "{_textureName},{r},{g},{b}".format(this);
      const cache = phina.particle2dx.ColoredTexture._cache;
      if (cache[key]) {
        if (!this._domElementBackup) this._domElementBackup = this.domElement;
        this.domElement = cache[key].domElement;
      } else {
        if (this._domElementBackup) this.domElement = this._domElementBackup;

        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.orig.domElement, 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "rgb({r},{g},{b})".format(this);
        ctx.fillRect(0, 0, this.width, this.height);

        const clone = this._canvasForCache.length ? this._canvasForCache.shift() : phina.graphics.Canvas().setSize(this.width, this.height);
        clone.context.drawImage(this.domElement, 0, 0);
        cache[key] = clone;
      }
    },

    _static: {
      _cache: {},
    },

  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.Emitter", {
    superClass: "phina.app.Object2D",

    active: false,
    random: null,

    particles: null,

    emitCount: 0,
    emitPerMillisec: 0,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.Emitter.defaults);

      this.random = phina.util.Random();

      this._initProperties(options);
      this._initParticles(options);

      this.emitPerMillisec = this.maxParticles / (this.particleLifespan * 1000);
    },

    _initProperties: function(options) {
      var json = phina.asset.AssetManager.get("json", options.jsonName).data;

      this.duration = json.duration;

      // 0:Gravity 1:Radius
      this.emitterType = json.emitterType;

      // this.configName = json.configName;

      this.particleLifespan = json.particleLifespan;
      this.particleLifespanVariance = json.particleLifespanVariance;
      this.maxParticles = json.maxParticles; // „Å™„Åú„ÅãÂÖ®ÁÑ∂Ë∂≥„Çä„Å™„ÅÑ„Åã„ÇâÔºíÂÄç‰Ωú„Å£„Å®„Åè
      this.angle = json.angle;
      this.angleVariance = json.angleVariance;
      this.speed = json.speed;
      this.speedVariance = json.speedVariance;
      this.sourcePositionVariancex = json.sourcePositionVariancex;
      this.sourcePositionVariancey = json.sourcePositionVariancey;
      this.gravityx = json.gravityx;
      this.gravityy = json.gravityy;

      // ‰∏≠ÂøÉ„Åã„Çâ„ÅÆÂä†ÈÄüÂ∫¶
      this.radialAcceleration = json.radialAcceleration;
      this.radialAccelVariance = json.radialAccelVariance;

      // Êé•Á∑öÂä†ÈÄüÂ∫¶
      this.tangentialAcceleration = json.tangentialAcceleration;
      this.tangentialAccelVariance = json.tangentialAccelVariance;

      this.maxRadius = json.maxRadius;
      this.maxRadiusVariance = json.maxRadiusVariance;
      this.minRadius = json.minRadius;
      this.minRadiusVariance = json.minRadiusVariance;
      this.rotatePerSecond = json.rotatePerSecond;
      this.rotatePerSecondVariance = json.rotatePerSecondVariance;

      // 1:additive 771:normal
      this.blendFuncDestination = json.blendFuncDestination;
      // 770Âõ∫ÂÆö
      this.blendFuncSource = json.blendFuncSource;

      this.startParticleSize = json.startParticleSize;
      this.startParticleSizeVariance = json.startParticleSizeVariance;
      if (json.finishParticleSize == -1) {
        this.finishParticleSize = this.startParticleSize;
      } else {
        this.finishParticleSize = json.finishParticleSize;
      }
      this.finishParticleSizeVariance = json.finishParticleSizeVariance;
      this.rotationStart = json.rotationStart;
      this.rotationStartVariance = json.rotationStartVariance;
      this.rotationEnd = json.rotationEnd;
      this.rotationEndVariance = json.rotationEndVariance;

      this.startColorRed = json.startColorRed;
      this.startColorGreen = json.startColorGreen;
      this.startColorBlue = json.startColorBlue;
      this.startColorAlpha = json.startColorAlpha;
      this.startColorVarianceRed = json.startColorVarianceRed;
      this.startColorVarianceGreen = json.startColorVarianceGreen;
      this.startColorVarianceBlue = json.startColorVarianceBlue;
      this.startColorVarianceAlpha = json.startColorVarianceAlpha;
      this.finishColorRed = json.finishColorRed;
      this.finishColorGreen = json.finishColorGreen;
      this.finishColorBlue = json.finishColorBlue;
      this.finishColorAlpha = json.finishColorAlpha;
      this.finishColorVarianceRed = json.finishColorVarianceRed;
      this.finishColorVarianceGreen = json.finishColorVarianceGreen;
      this.finishColorVarianceBlue = json.finishColorVarianceBlue;
      this.finishColorVarianceAlpha = json.finishColorVarianceAlpha;

      // this.textureFileName = json.textureFileName;
      // this.textureImageData = json.textureImageData;
      // this.yCoordFlipped = json.yCoordFlipped;
    },

    _initParticles: function(options) {
      this.particles = Array.range(0, this.maxParticles)
        .map(function(index) {
          var p = this._createParticle(options.textureName, index);
          p.on("removed", function() {
            p.visible = false;
            this.particles.push(p);
          }.bind(this));
          return p;
        }.bind(this));
    },

    _createParticle: function(textureName, index) {
      throw "no impl";
    },

    _createParticleAccessory: function() {
      return phina.particle2dx.Particle();
    },

    start: function() {
      this.active = true;
      if (this.duration > 0) {
        this.tweener
          .clear()
          .wait(this.duration * 1000)
          .set({ active: false });
      }

      return this;
    },

    stop: function() {
      this.active = false;
      return this;
    },

    update: function(app) {
      if (!this.active) return;

      this.emitCount += this.emitPerMillisec * app.deltaTime;
      for (var i = 0; i < ~~this.emitCount; i++) {
        this.emit();
      }
      this.emitCount -= ~~(this.emitCount);
    },

    emit: function() {
      var p = this.particles.shift();
      if (!p) {
        // console.warn("„Åü„Çä„Å™„ÅÑ");
        return;
      }
      p.addChildTo(this.parent);

      var r = this.random;
      var particle = p.particle;

      particle.life = this.particleLifespan + r.randfloat(-this.particleLifespanVariance, this.particleLifespanVariance);
      particle.emitterType = this.emitterType;
      particle.emitterPosition.set(this.x, this.y);

      var sizeFrom = this.startParticleSize + r.randfloat(-this.startParticleSizeVariance, this.startParticleSizeVariance);
      var sizeTo = this.finishParticleSize + r.randfloat(-this.finishParticleSizeVariance, this.finishParticleSizeVariance);
      var rotationFrom = this.rotationStart + r.randfloat(-this.rotationStartVariance, this.rotationStartVariance);
      var rotationTo = this.rotationEnd + r.randfloat(-this.rotationEndVariance, this.rotationEndVariance);

      var rFrom = this.startColorRed + r.randfloat(-this.startColorVarianceRed, this.startColorVarianceRed);
      var rTo = this.finishColorRed + r.randfloat(-this.finishColorVarianceRed, this.finishColorVarianceRed);
      var gFrom = this.startColorGreen + r.randfloat(-this.startColorVarianceGreen, this.startColorVarianceGreen);
      var gTo = this.finishColorGreen + r.randfloat(-this.finishColorVarianceGreen, this.finishColorVarianceGreen);
      var bFrom = this.startColorBlue + r.randfloat(-this.startColorVarianceBlue, this.startColorVarianceBlue);
      var bTo = this.finishColorBlue + r.randfloat(-this.finishColorVarianceBlue, this.finishColorVarianceBlue);
      var aFrom = this.startColorAlpha + r.randfloat(-this.startColorVarianceAlpha, this.startColorVarianceAlpha);
      var aTo = this.finishColorAlpha + r.randfloat(-this.finishColorVarianceAlpha, this.finishColorVarianceAlpha);

      if (this.emitterType === 0) {

        particle.position.x = this.x + r.randfloat(-this.sourcePositionVariancex, this.sourcePositionVariancex);
        particle.position.y = this.y + r.randfloat(-this.sourcePositionVariancey, this.sourcePositionVariancey);

        var angle = (this.angle + r.randfloat(-this.angleVariance, this.angleVariance)).toRadian();
        var speed = this.speed + r.randfloat(-this.speedVariance, this.speedVariance);

        particle.velocity.set(Math.cos(angle) * speed, -Math.sin(angle) * speed);
        particle.gravity.set(this.gravityx, this.gravityy);
        particle.initRadialAccel(this.radialAcceleration + r.randfloat(-this.radialAccelVariance, this.radialAccelVariance));
        particle.tangentialAccel = this.tangentialAcceleration + r.randfloat(-this.tangentialAccelVariance, this.tangentialAccelVariance);

        particle.set({
          sizeFrom: sizeFrom,
          sizeTo: sizeTo,
          rotationFrom: rotationFrom,
          rotationTo: rotationTo,
          rFrom: rFrom,
          rTo: rTo,
          gFrom: gFrom,
          gTo: gTo,
          bFrom: bFrom,
          bTo: bTo,
          aFrom: aFrom,
          aTo: aTo,
        });

      } else if (this.emitterType === 1) {

        particle.posAngle = this.angle + r.randfloat(-this.angleVariance, this.angleVariance);

        var radiusFrom = this.maxRadius + r.randfloat(-this.maxRadiusVariance, this.maxRadiusVariance);
        var radiusTo = this.minRadius + r.randfloat(-this.minRadiusVariance, this.minRadiusVariance);
        particle.rotPerSec = (this.rotatePerSecond + r.randfloat(-this.rotatePerSecondVariance, this.rotatePerSecondVariance)).toRadian();

        particle.set({
          sizeFrom: sizeFrom,
          sizeTo: sizeTo,
          rotationFrom: rotationFrom,
          rotationTo: rotationTo,
          rFrom: rFrom,
          rTo: rTo,
          gFrom: gFrom,
          gTo: gTo,
          bFrom: bFrom,
          bTo: bTo,
          aFrom: aFrom,
          aTo: aTo,
          radiusFrom: radiusFrom,
          radiusTo: radiusTo,
        });
      }

      particle.update({ deltaTime: 0 });
    },

    _static: {
      defaults: {
        jsonName: null,
        textureName: null,
      },
    },

  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.EmitterGL", {
    superClass: "phina.particle2dx.Emitter",

    gl: null,
    texture: null,

    init: function(options) {
      this.superInit(options);
      this.textureName = options.textureName;
    },

    _initParticles: function(options) {
      this.oneInstanceData = [
        // instanceVisible
        0,
        // instancePosition
        0, 0,
        // instanceRotation
        0,
        // instanceScale
        1,
        // instanceColor
        0, 0, 0, 0,
      ];

      var rawArray = Array.range(0, this.maxParticles).map(function() {
        return this.oneInstanceData;
      }.bind(this)).flatten();
      this.instanceData = new Float32Array(rawArray);

      this.superMethod("_initParticles", options);
    },

    _createParticle: function(textureName, index) {
      var p = phina.particle2dx.ParticleGL(this, index);
      p.particle = this._createParticleAccessory().attachTo(p);
      return p;
    },

    setup: function(layer) {
      var gl = layer.gl;
      var ext = layer.ext;
      var vpMatrix = layer.vpMatrix;

      this.texture = phigl.Texture(gl, this.textureName);

      this.drawable = phigl.InstancedDrawable(gl, ext)
        .setProgram(this._createProgram(gl))
        .setIndexValues([0, 1, 2, 2, 1, 3])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            // Â∑¶‰∏ä
            -0.5, +0.5,
            // Â∑¶‰∏ã
            -0.5, -0.5,
            // Âè≥‰∏ä
            +0.5, +0.5,
            // Âè≥‰∏ã
            +0.5, -0.5,
          ]
        }, {
          unitSize: 2,
          data: [
            // Â∑¶‰∏ä
            0, 1,
            // Â∑¶‰∏ã
            0, 0,
            // Âè≥‰∏ä
            1, 1,
            // Âè≥‰∏ã
            1, 0,
          ],
        }])
        .declareInstanceAttributes([
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceColor",
        ])
        .declareUniforms("vpMatrix", "texture");

      return this;
    },

    render: function(layer) {
      var gl = layer.gl;
      if (this.blendFuncDestination === 1) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      } else if (this.blendFuncDestination === 771) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      }

      this.drawable.uniforms["vpMatrix"].setValue(layer.vpMatrix);
      this.drawable.uniforms["texture"].setValue(0).setTexture(this.texture);
      this.drawable.setInstanceAttributeData(this.instanceData);
      this.drawable.draw(this.maxParticles);
    },

    _createProgram: function(gl) {
      var srcV = phina.particle2dx.EmitterGL.vertexShaderSource;
      var srcF = phina.particle2dx.EmitterGL.fragmentShaderSource;

      return phigl.Program(gl)
        .attach(phigl.VertexShader().setSource(srcV))
        .attach(phigl.FragmentShader().setSource(srcF))
        .link();
    },

    _static: {

      vertexShaderSource: [
        "attribute vec2 position;",
        "attribute vec2 uv;",

        "attribute float instanceVisible;",
        "attribute vec2 instancePosition;",
        "attribute float instanceRotation;",
        "attribute float instanceScale;",
        "attribute vec4 instanceColor;",

        "uniform mat4 vpMatrix;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  vUv = uv;",
        "  vColor = instanceColor;",
        "  if (instanceVisible > 0.5) {",
        "    float s = sin(-instanceRotation);",
        "    float c = cos(-instanceRotation);",
        "    mat4 m = mat4(",
        "      vec4(c, -s, 0.0, 0.0),",
        "      vec4(s, c, 0.0, 0.0),",
        "      vec4(0.0, 0.0, 1.0, 0.0),",
        "      vec4(instancePosition, 0.0, 1.0)",
        "    ) * mat4(",
        "      vec4(instanceScale, 0.0, 0.0, 0.0),",
        "      vec4(0.0, instanceScale, 0.0, 0.0),",
        "      vec4(0.0, 0.0, 1.0, 0.0),",
        "      vec4(0.0, 0.0, 0.0, 1.0)",
        "    );",
        "    mat4 mvpMatrix = vpMatrix * m;",
        "    gl_Position = mvpMatrix * vec4(position, 0.0, 1.0);",
        "  } else {",
        "    gl_Position = vec4(0.0);",
        "  }",
        "}",
      ].join("\n"),

      fragmentShaderSource: [
        "precision mediump float;",

        "uniform sampler2D texture;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  vec4 col = texture2D(texture, vUv);",
        "  if (col.a == 0.0) discard;",
        "  gl_FragColor = col * vColor;",
        "}",
      ].join("\n"),
    }

  });

  phina.define("phina.particle2dx.ParticleGL", {
    superClass: "phina.app.Element",

    oneDataLength: 0,
    instanceData: null,
    index: 0,

    init: function(emitter, index) {
      this.superInit();
      this.oneDataLength = emitter.oneInstanceData.length;
      this.instanceData = emitter.instanceData;
      this.index = index;
    },

    _accessor: {
      visible: {
        get: function() {
          return !!this.instanceData[this.oneDataLength * this.index + 0];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 0] = v ? 1 : 0;
        },
      },
      x: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 1] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 2] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 3] = v;
        },
      },
      scale: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 4] = v;
        },
      },
      r: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 5] = v;
        },
      },
      g: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 6];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 6] = v;
        },
      },
      b: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 7] = v;
        },
      },
      a: {
        get: function() {
          return this.instanceData[this.oneDataLength * this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.oneDataLength * this.index + 8] = v;
        },
      },
    },
  });

});
{
	"startColorAlpha": 1,
	"startParticleSizeVariance": 1,
	"startColorGreen": 0.25,
	"rotatePerSecond": 0,
	"radialAcceleration": 0,
	"yCoordFlipped": -1,
	"emitterType": 0,
	"blendFuncSource": 770 ,
	"finishColorVarianceAlpha": 0,
	"rotationEnd": 0,
	"startColorVarianceBlue": 0,
	"rotatePerSecondVariance": 0,
	"particleLifespan": 1.24,
	"minRadius": 0,
	"configName": "fire",
	"tangentialAcceleration": 0,
	"rotationStart": 0,
	"startColorVarianceGreen": 0,
	"speed": 60,
	"minRadiusVariance": 0,
	"finishColorVarianceBlue": 0,
	"finishColorBlue": 0,
	"finishColorGreen": 0,
	"blendFuncDestination": 1,
	"finishColorAlpha": 1,
	"sourcePositionVariancex": 10,
	"startParticleSize": 5,
	"sourcePositionVariancey": 5,
	"startColorRed": 0.75,
	"finishColorVarianceRed": 0,
	"textureFileName": "rain.png",
	"startColorVarianceAlpha": 0,
	"maxParticles": 207,
	"finishColorVarianceGreen": 0,
	"finishParticleSize": -1,
	"duration": -1,
	"startColorVarianceRed": 0,
	"finishColorRed": 0,
	"gravityx": 0,
	"maxRadiusVariance": 0,
	"finishParticleSizeVariance": 0,
	"gravityy": 0,
	"rotationEndVariance": 0,
	"startColorBlue": 0.11,
	"rotationStartVariance": 0,
	"speedVariance": 20,
	"radialAccelVariance": 0,
	"textureImageData": "",
	"tangentialAccelVariance": 0,
	"particleLifespanVariance": 0.25,
	"angleVariance": 10,
	"angle": -90,
	"maxRadius": 0
}
âPNG

   IHDR           szzÙ   gAMA  Ø»7äÈ   tEXtSoftware Adobe ImageReadyq…e<  dIDATx⁄ƒóânÎ EΩ·-Kˇˇ7__ÿƒÆ-›©nß8¡ë™D∫ ÃôÖÁÀ≤dÔ|U/ÃiV´rhÅÊU˛Ëbyb6£¿õ ¿}UÄ¶Tòg®°Ü>DA 3!Cü_hI Ç(	‡N∆=dW9Ä∫£ ‘ì:¿4 <åYJôD ¶à«ßUgËD0íÁR32&√8˜†@√◊U—íw Ö∑(Mü°Ò¿W|OÔ≈¯¨v».Äô‰˛DQ∏R:2" ÖøR∆éÂc Ü∂úÜ8´Tt[PXmƒÛâj√aéŸ®†Uª@@> “SGî8–zsdW˛ïÇÜLMÈh’Æ∏ ‚åﬂK‰◊¡≥Lu¬6“?*|˜P`±JÅà”"u—c\Ä˜¢•πµZ∑§4}H_êRïû—00ö!◊Å≥¡íÁ‘æIÚ*Ri1 ≥"qΩ KÇfµß7œox¯]∆§¨˜#l‰N‚„ï∑”@Û•˛	*®ıÊ= ›≠-ƒMf†j’.¯èˇ-∆O–¨<™\©.r∫Iµ«˙¿'“biÆß»ÍøQPaè’^u5›	oàƒsÇaàËY0Eé‘zßΩ⁄gÅ@0àUıXîõHÏ`Ò	«Òf¸ﬂÑtèXDw¨Yµ◊g ÖO*Nª∆ ∏ô∞Á#ù˜œnDÉJE2@ÜÅ|ç∫´ßﬁ	áH!&_J≠∫nO ˚#∑b˜ ≠X"¡ Gü| s¡€üåÚNﬂÚl¯gØ"{ÛÎKÄ ∏!râ}    IENDÆB`Ç
phina.namespace(function() {

  phina.define("phina.particle2dx.Particle", {
    superClass: "phina.accessory.Accessory",

    emitterType: 0,

    r: 1.0,
    g: 1.0,
    b: 1.0,
    a: 1.0,

    emitterPosition: null,
    life: 0,

    position: null,
    velocity: null,
    gravity: null,
    radialAccel: null,
    tangentialAccel: 0,
    _tangentialAccel: null,

    posAngle: 0,
    rotPerSec: 0,

    init: function() {
      this.superInit();

      this.position = phina.geom.Vector2();
      this.velocity = phina.geom.Vector2();
      this.gravity = phina.geom.Vector2();
      this.radialAccel = phina.geom.Vector2();
      this.emitterPosition = phina.geom.Vector2();
      this._tangentialAccel = phina.geom.Vector2();
    },

    initRadialAccel: function(radialAccelLength) {
      this.radialAccel
        .set(this.position.x - this.emitterPosition.x, this.position.y - this.emitterPosition.y)
        .normalize()
        .mul(radialAccelLength);
    },

    set: function(data) {
      var duration = this.life * 1000;
      var p = this.target;
      p.visible = true;
      if (this.emitterType === 0) {
        p.$extend({
          scale: data.sizeFrom,
          rotation: data.rotationFrom,
          r: data.rFrom,
          g: data.gFrom,
          b: data.bFrom,
          a: data.aFrom,
        });
        p.tweener
          .clear()
          .to({
            scale: data.sizeTo,
            rotation: data.rotationTo,
            r: data.rTo,
            g: data.gTo,
            b: data.bTo,
            a: data.aTo,
          }, duration)
          .call(function() {
            p.remove();
          });
      } else if (this.emitterType === 1) {
        p.$extend({
          scale: data.sizeFrom,
          rotation: data.rotationFrom,
          r: data.rFrom,
          g: data.gFrom,
          b: data.bFrom,
          a: data.aFrom,
          posRadius: data.radiusFrom,
        });
        p.tweener
          .clear()
          .to({
            scale: data.sizeTo,
            rotation: data.rotationTo,
            r: data.rTo,
            g: data.gTo,
            b: data.bTo,
            a: data.aTo,
            posRadius: data.radiusTo,
          }, duration)
          .call(function() {
            p.remove();
          });
      }
    },

    update: function(app) {
      var deltaSec = app.deltaTime * 0.001;

      if (this.emitterType === 0) {
        add(this.velocity, this.gravity, deltaSec);
        add(this.velocity, this.radialAccel, deltaSec);

        if (this.tangentialAccel) {
          this._tangentialAccel
            .set(this.position.x - this.emitterPosition.x, this.position.y - this.emitterPosition.y);

          this._tangentialAccel
            .set(-this._tangentialAccel.y, this._tangentialAccel.x) // 90Â∫¶Âõû„Åô
            .normalize()
            .mul(this.tangentialAccel);
          add(this.velocity, this._tangentialAccel, deltaSec);
        }

        add(this.position, this.velocity, deltaSec);
      } else if (this.emitterType === 1) {
        this.posAngle -= this.rotPerSec * deltaSec;
        this.position.set(
          this.emitterPosition.x + Math.cos(this.posAngle) * this.target.posRadius,
          this.emitterPosition.y - Math.sin(this.posAngle) * this.target.posRadius
        );
      }

      this.target.x = this.position.x;
      this.target.y = this.position.y;
    },

  });

  var add = function(vec1, vec2, deltaSec) {
    vec1.x += vec2.x * deltaSec;
    vec1.y -= vec2.y * deltaSec;
  };

});
phina.namespace(function() {

  phina.define("phina.particle2dx.ParticleCanvas", {
    superClass: "phina.display.Sprite",

    particle: null,

    init: function(image) {
      this.superInit(image);
      this.particle = phina.particle2dx.Particle().attachTo(this);
    },

    draw: function(canvas) {
      if (this.image.setColor) this.image.setColor(this.r, this.g, this.b);
      this.superMethod("draw", canvas);
    },

  });

});
phina.namespace(function() {

  phina.define("phina.particle2dx.ParticleGLLayer", {
    superClass: "phina.display.Layer",

    emitters: null,

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phina.particle2dx.ParticleGLLayer.defaults);

      this.emitters = [];

      this.domElement = options.domElement || document.createElement("canvas");
      this.domElement.width = this.width * options.quality;
      this.domElement.height = this.height * options.quality;

      var gl = this.domElement.getContext("webgl") || this.domElement.getContext("experimental-webgl");

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

      var projectionMatrix = mat4.create();
      var viewMatrix = mat4.create();
      var modelMatrix = mat4.create();
      var vpMatrix = mat4.create();
      mat4.ortho(projectionMatrix, 0, this.width, this.height, 0, 0.9, 1.1);
      mat4.lookAt(viewMatrix, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
      mat4.mul(vpMatrix, projectionMatrix, viewMatrix);

      this.gl = gl;
      this.ext = phigl.Extensions.getInstancedArrays(gl);
      this.vpMatrix = vpMatrix;
    },

    createEmitter: function(options) {
      var emitter = phina.particle2dx.EmitterGL(options);
      this.emitters.push(emitter);
      emitter.addChildTo(this);
      emitter.setup(this);
      emitter.on("removed", function() {
        this.emitters.erase(emitter);
      }.bind(this));
      return emitter;
    },

    draw: function(canvas) {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      this._drawParticles();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image,
        0, 0, image.width, image.height, //
        -this.width * this.originX, -this.height * this.originY, this.width, this.height //
      );
    },

    _drawParticles: function() {
      for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].render(this);
      }
    },

    _static: {
      defaults: {},
    },
  });

});
{
	"startColorAlpha": 0.34,
	"startParticleSizeVariance": 2,
	"startColorGreen": 1,
	"rotatePerSecond": 0,
	"radialAcceleration": 0,
	"yCoordFlipped": -1,
	"emitterType": 0,
	"blendFuncSource": 770 ,
	"finishColorVarianceAlpha": 0,
	"rotationEnd": 0,
	"startColorVarianceBlue": 0.2,
	"rotatePerSecondVariance": 0,
	"particleLifespan": 0.7,
	"minRadius": 0,
	"configName": "fire",
	"tangentialAcceleration": 0,
	"rotationStart": 0,
	"startColorVarianceGreen": 0,
	"speed": 600,
	"minRadiusVariance": 0,
	"finishColorVarianceBlue": 0,
	"finishColorBlue": 0,
	"finishColorGreen": 0,
	"blendFuncDestination": 771,
	"finishColorAlpha": 1,
	"sourcePositionVariancex": -320,
	"startParticleSize": 16,
	"sourcePositionVariancey": -385,
	"startColorRed": 1,
	"finishColorVarianceRed": 0,
	"textureFileName": "rain.png",
	"startColorVarianceAlpha": 0.2,
	"maxParticles": 218,
	"finishColorVarianceGreen": 0,
	"finishParticleSize": 16,
	"duration": -1,
	"startColorVarianceRed": 0,
	"finishColorRed": 0,
	"gravityx": 0,
	"maxRadiusVariance": 0,
	"finishParticleSizeVariance": 0,
	"gravityy": -40,
	"rotationEndVariance": 0,
	"startColorBlue": 1,
	"rotationStartVariance": 0,
	"speedVariance": 39,
	"radialAccelVariance": 0,
	"textureImageData": "",
	"tangentialAccelVariance": 0,
	"particleLifespanVariance": 0,
	"angleVariance": 4,
	"angle": 109,
	"maxRadius": 0
}
âPNG

   IHDR   -   -   :‚ö  
AiCCPICC Profile  HùñwTSŸáœΩ7Ω–" %Ùz	 “;HQâIÄPÜÑ&vDF)VdT¿Gá"cEÉÇb◊	ÚP∆¡QDEÂ›åk	Ô≠5Ûﬁö˝«YﬂŸÁ∑◊ŸgÔ}◊∫ P¸Ç¬tXÄ4°XÓÎ¡\Àƒ˜X¿·ffG¯D‘¸Ω=ôô®H∆≥ˆÓ.Ädª€,øP&s÷ˇë"7C$ 
E’6<~&ÂîS≥≈2ˇ Ùï)2Ü12°	¢¨"„ƒØlˆßÊ+ª…òó&‰°YŒº4ûåªPﬁö%·£å°\ò%‡g£|eΩTIö Â˜(””¯úL 0ô_ÃÁ&°lâ2EÓâÚ îƒ9ºrã˘9hû x¶g‰äâIb¶◊òiÂË»f˙Ò≥S˘b1+î√M·àxLœÙ¥é0ÄØoñE%YmôhëÌ≠ÌÌY÷Êh˘øŸﬂ~S˝=»z˚UÒ&ÏœûAåûYﬂlÏ¨/Ω ˆ$Zõ≥æïU ¥m@Â·¨OÔ  Ú ¥ﬁúÛÜl^íƒ‚'ãÏÏlsük.+Ë7˚üÇo øÜ9˜ôÀÓ˚V;¶?Å#I3eEÂ¶ß¶KDÃÃóœd˝˜ˇ„¿9iÕ…√,úü¿ÒÖËUQËî	ÑâhªÖ<ÅXê.d
Ñ’·6'~ùkhu_ }Ö9P∏I»o= C#$n?z}Î[1
»æºh≠ëØsè2z˛Á˙\än·LA"SÊˆèdr%¢,£ﬂÑl¡êt†
4Å.0,`Ä3pﬁ  ÑÄHñ.Hi@≤A>ÿ 
A1ÿvÉjp ‘Åz–NÇ6p\W¿pÄG@
Ü¡K0ﬁÅiÇ¢A™ê§ôB÷ZyCAP8≈Câêí@˘–&®*É™°CP=Ù#t∫]É˙†– 4˝}Ñò”aÿ ∂ÄŸ∞;G¬À‡Dxú¿€·J∏>∑¬· ,Ö_¬ì@»—FXÒDBêX$!kë"§©Eöê§πçHëq‰á°aò∆„áYå·bVa÷bJ0’òcòVLÊ6f3Å˘Ç•b’±¶X'¨?v	6õç-ƒV`è`[∞ó±ÿaÏ;«¿‚p~∏\2n5Æ∑◊åªÄÎ√·&Òxº*ﬁÔÇ¡sb|!æ
ﬂè∆ø'ê	ZkÇ!ñ $l$TÁ˝Ñ¬4QÅ®Ot"Üyƒ\b)±éÿAºI&NìIÜ$R$)ô¥ÅTIj"]&=&Ω!ì…:dGrY@^OÆ$ü _%í?Pî(&OJEBŸN9Jπ@y@yC•R®n‘X™ò∫ùZOΩD}J}/Gì3óÛó„…≠ì´ëkïÎó{%Oî◊ówó_.ü'_!J˛¶¸∏Q¡@¡SÅ£∞V°F·¥¬=ÖIEö¢ïbàböbâbÉ‚5≈Q%ºíÅí∑O©@È∞“%•!B”•y“∏¥M¥:⁄e⁄0G7§˚”ìÈ≈ÙËΩÙ	e%e[Â(ÂÂÂ≥ R¬0`¯3R•åìåªåèÛ4Êπœ„œ€6Øi^ˇº)ï˘*n*|ï"ïfïïè™LUo’’ù™m™O‘0j&jajŸj˚’.´çœßœwûœù_4ˇ‰¸áÍ∞∫âz∏˙jı√Í=ÍìöæUó4∆5önö…öÂöÁ4«¥hZµZÂZÁµ^0ïôÓÃTf%≥ã9°≠ÆÌß-—>§›´=≠c®≥Xg£N≥Œ]í.[7A∑\∑SwBOK/X/_ØQÔ°>Qü≠ü§øGø[ ¿– ⁄`ãAõ¡®°ä°øaûa£·c#™ë´—*£Z£;∆8c∂qäÒ>„[&∞âùIíIç…MSÿ‘ﬁT`∫œ¥œkÊh&4´5ª«¢∞‹YY¨F÷†9√<»|£yõ˘+=ãXãù›_,Ì,S-Î,Y)YXm¥Í∞˙√⁄ƒök]c}«Üj„c≥Œ¶›Êµ≠©-ﬂvøÌ};ö]∞›ªNªœˆˆ"˚&˚1=áxáΩ˜ÿtv(ªÑ}’ÎË·∏ŒÒå„'{'±”IßﬂùYŒ)ŒŒ£‘-r—q·∏rë.d.å_xp°‘U€ï„ZÎ˙ÃM◊çÁvƒmƒ›ÿ=Ÿ˝∏˚+KëGã«îßìÁœ^àóØWëWØ∑í˜bÔjÔß>:>â>ç>ævæ´}/¯a˝˝v˙›Û◊Á˙◊˚O8¨	Ë
§FV>2	u√¡¡ªÇ/“_$\‘B¸CvÖ<	5]˙s.,4¨&Ïy∏Ux~xw-bEDCƒªHè»“»GãçKwF…G≈E’GME{EóEKóX,Y≥‰FåZå ¶={$vr©˜“›Ká„Ï‚
„Ó.3\ñ≥Ï⁄rµÂ©ÀœÆê_¡Yq*ﬂˇâ¬©ÂLÆÙ_πwÂ◊ìªá˚íÁ∆+ÁçÒ]¯e¸ëóÑ≤Ñ—Dóƒ]âcIÆII„OAµ‡u≤_ÚÅ‰©îêî£)3©—©ÕiÑ¥¯¥”B%aä∞+]3='Ω/√4£0C∫ i’ÓU¢@—ëL(sYfªòé˛LıHå$õ%ÉY≥j≤ﬁgGeü QÃÊÙ‰ö‰nÀ…Û…˚~5f5wugæv˛Ü¸¡5Ók≠Ö÷Æ\€πNw]¡∫·ıæÎèm mHŸÀFÀçeﬂnäﬁ‘Q†Q∞æ`h≥ÔÊ∆BπBQ·Ω-Œ[l≈llÌ›f≥≠j€ó"^—ıbÀ‚ä‚O%‹íÎﬂY}W˘›ÃˆÑÌΩ•ˆ•˚w‡vw‹›È∫ÛXôbY^Ÿ–Æ‡]≠ÂÃÚ¢Ú∑ªWÏæVa[q`ièdè¥2®≤ΩJØjG’ßÍ§ÍÅèöÊΩÍ{∑Ìù⁄«€◊øﬂm”ç≈>º»˜Pk≠Am≈a‹·¨√œÎ¢Í∫øg_DÌHÒëœGÖG•«¬èu’;‘◊7®7î6¬çí∆±„q«o˝‡ıC{´ÈP3£π¯8!9Ò‚«¯Ôû<Ÿyä}™È'˝üˆ∂–ZäZ°÷‹÷â∂§6i{L{ﬂÈÄ”ùŒ-?õˇ|Ùåˆôö≥ gKœëŒúõ9üw~ÚB∆ÖÒãâá:Wt>∫¥‰“ùÆ∞ÆﬁÀÅóØ^Òπr©€Ω˚¸Uó´gÆ9];}ù}ΩÌÜ˝ç÷ªûñ_Ï~iÈµÔmΩÈp≥˝ñ„≠éæ}Á˙]˚/ﬁˆ∫}Âéˇùã˙Ó.æ{ˇ^‹=È}ﬁ˝—©^?Ãz8˝h˝cÏ„¢'
O*û™?≠˝’¯◊f©ΩÙÏ†◊`œ≥àgèÜ∏C/ˇï˘ØO√œ©œ+F¥FÍG≠Gœå˘å›z±Ù≈Àåó”„Öø)˛∂˜ï—´ü~w˚Ωgb…ƒk—Îô?Jﬁ®æ9˙÷ˆmÁdË‰”wiÔ¶ßäﬁ´æ?ˆÅ˝°˚cÙ«ëÈÏO¯Oïüç?w|	¸Úx&mfÊﬂ˜ÑÛ˚2:Y~   	pHYs     öú   éIDATX	Ì–±É`≈`@Yá˝˜Hôe˛ ¬#∏8…◊∏{:}˚v›ZÎ{w»˝>Ô£Áêáü7èIœÚkO#a7i[ò˝§ë∞õ¥-Ã~“HÿM⁄f?i$Ï&m≥ü4vì∂ÖŸO	ªI€¬Ï'çÑ›§maˆìF¬n“∂0˚I#a7i[ò˝§ë∞õ¥-Ã˛Hiû’?d0w∞    IENDÆB`Ç
âPNG

   IHDR   -   -   :‚ö  
AiCCPICC Profile  HùñwTSŸáœΩ7Ω–" %Ùz	 “;HQâIÄPÜÑ&vDF)VdT¿Gá"cEÉÇb◊	ÚP∆¡QDEÂ›åk	Ô≠5Ûﬁö˝«YﬂŸÁ∑◊ŸgÔ}◊∫ P¸Ç¬tXÄ4°XÓÎ¡\Àƒ˜X¿·ffG¯D‘¸Ω=ôô®H∆≥ˆÓ.Ädª€,øP&s÷ˇë"7C$ 
E’6<~&ÂîS≥≈2ˇ Ùï)2Ü12°	¢¨"„ƒØlˆßÊ+ª…òó&‰°YŒº4ûåªPﬁö%·£å°\ò%‡g£|eΩTIö Â˜(””¯úL 0ô_ÃÁ&°lâ2EÓâÚ îƒ9ºrã˘9hû x¶g‰äâIb¶◊òiÂË»f˙Ò≥S˘b1+î√M·àxLœÙ¥é0ÄØoñE%YmôhëÌ≠ÌÌY÷Êh˘øŸﬂ~S˝=»z˚UÒ&ÏœûAåûYﬂlÏ¨/Ω ˆ$Zõ≥æïU ¥m@Â·¨OÔ  Ú ¥ﬁúÛÜl^íƒ‚'ãÏÏlsük.+Ë7˚üÇo øÜ9˜ôÀÓ˚V;¶?Å#I3eEÂ¶ß¶KDÃÃóœd˝˜ˇ„¿9iÕ…√,úü¿ÒÖËUQËî	ÑâhªÖ<ÅXê.d
Ñ’·6'~ùkhu_ }Ö9P∏I»o= C#$n?z}Î[1
»æºh≠ëØsè2z˛Á˙\än·LA"SÊˆèdr%¢,£ﬂÑl¡êt†
4Å.0,`Ä3pﬁ  ÑÄHñ.Hi@≤A>ÿ 
A1ÿvÉjp ‘Åz–NÇ6p\W¿pÄG@
Ü¡K0ﬁÅiÇ¢A™ê§ôB÷ZyCAP8≈Câêí@˘–&®*É™°CP=Ù#t∫]É˙†– 4˝}Ñò”aÿ ∂ÄŸ∞;G¬À‡Dxú¿€·J∏>∑¬· ,Ö_¬ì@»—FXÒDBêX$!kë"§©Eöê§πçHëq‰á°aò∆„áYå·bVa÷bJ0’òcòVLÊ6f3Å˘Ç•b’±¶X'¨?v	6õç-ƒV`è`[∞ó±ÿaÏ;«¿‚p~∏\2n5Æ∑◊åªÄÎ√·&Òxº*ﬁÔÇ¡sb|!æ
ﬂè∆ø'ê	ZkÇ!ñ $l$TÁ˝Ñ¬4QÅ®Ot"Üyƒ\b)±éÿAºI&NìIÜ$R$)ô¥ÅTIj"]&=&Ω!ì…:dGrY@^OÆ$ü _%í?Pî(&OJEBŸN9Jπ@y@yC•R®n‘X™ò∫ùZOΩD}J}/Gì3óÛó„…≠ì´ëkïÎó{%Oî◊ówó_.ü'_!J˛¶¸∏Q¡@¡SÅ£∞V°F·¥¬=ÖIEö¢ïbàböbâbÉ‚5≈Q%ºíÅí∑O©@È∞“%•!B”•y“∏¥M¥:⁄e⁄0G7§˚”ìÈ≈ÙËΩÙ	e%e[Â(ÂÂÂ≥ R¬0`¯3R•åìåªåèÛ4Êπœ„œ€6Øi^ˇº)ï˘*n*|ï"ïfïïè™LUo’’ù™m™O‘0j&jajŸj˚’.´çœßœwûœù_4ˇ‰¸áÍ∞∫âz∏˙jı√Í=ÍìöæUó4∆5önö…öÂöÁ4«¥hZµZÂZÁµ^0ïôÓÃTf%≥ã9°≠ÆÌß-—>§›´=≠c®≥Xg£N≥Œ]í.[7A∑\∑SwBOK/X/_ØQÔ°>Qü≠ü§øGø[ ¿– ⁄`ãAõ¡®°ä°øaûa£·c#™ë´—*£Z£;∆8c∂qäÒ>„[&∞âùIíIç…MSÿ‘ﬁT`∫œ¥œkÊh&4´5ª«¢∞‹YY¨F÷†9√<»|£yõ˘+=ãXãù›_,Ì,S-Î,Y)YXm¥Í∞˙√⁄ƒök]c}«Üj„c≥Œ¶›Êµ≠©-ﬂvøÌ};ö]∞›ªNªœˆˆ"˚&˚1=áxáΩ˜ÿtv(ªÑ}’ÎË·∏ŒÒå„'{'±”IßﬂùYŒ)ŒŒ£‘-r—q·∏rë.d.å_xp°‘U€ï„ZÎ˙ÃM◊çÁvƒmƒ›ÿ=Ÿ˝∏˚+KëGã«îßìÁœ^àóØWëWØ∑í˜bÔjÔß>:>â>ç>ævæ´}/¯a˝˝v˙›Û◊Á˙◊˚O8¨	Ë
§FV>2	u√¡¡ªÇ/“_$\‘B¸CvÖ<	5]˙s.,4¨&Ïy∏Ux~xw-bEDCƒªHè»“»GãçKwF…G≈E’GME{EóEKóX,Y≥‰FåZå ¶={$vr©˜“›Ká„Ï‚
„Ó.3\ñ≥Ï⁄rµÂ©ÀœÆê_¡Yq*ﬂˇâ¬©ÂLÆÙ_πwÂ◊ìªá˚íÁ∆+ÁçÒ]¯e¸ëóÑ≤Ñ—Dóƒ]âcIÆII„OAµ‡u≤_ÚÅ‰©îêî£)3©—©ÕiÑ¥¯¥”B%aä∞+]3='Ω/√4£0C∫ i’ÓU¢@—ëL(sYfªòé˛LıHå$õ%ÉY≥j≤ﬁgGeü QÃÊÙ‰ö‰nÀ…Û…˚~5f5wugæv˛Ü¸¡5Ók≠Ö÷Æ\€πNw]¡∫·ıæÎèm mHŸÀFÀçeﬂnäﬁ‘Q†Q∞æ`h≥ÔÊ∆BπBQ·Ω-Œ[l≈llÌ›f≥≠j€ó"^—ıbÀ‚ä‚O%‹íÎﬂY}W˘›ÃˆÑÌΩ•ˆ•˚w‡vw‹›È∫ÛXôbY^Ÿ–Æ‡]≠ÂÃÚ¢Ú∑ªWÏæVa[q`ièdè¥2®≤ΩJØjG’ßÍ§ÍÅèöÊΩÍ{∑Ìù⁄«€◊øﬂm”ç≈>º»˜Pk≠Am≈a‹·¨√œÎ¢Í∫øg_DÌHÒëœGÖG•«¬èu’;‘◊7®7î6¬çí∆±„q«o˝‡ıC{´ÈP3£π¯8!9Ò‚«¯Ôû<Ÿyä}™È'˝üˆ∂–ZäZ°÷‹÷â∂§6i{L{ﬂÈÄ”ùŒ-?õˇ|Ùåˆôö≥ gKœëŒúõ9üw~ÚB∆ÖÒãâá:Wt>∫¥‰“ùÆ∞ÆﬁÀÅóØ^Òπr©€Ω˚¸Uó´gÆ9];}ù}ΩÌÜ˝ç÷ªûñ_Ï~iÈµÔmΩÈp≥˝ñ„≠éæ}Á˙]˚/ﬁˆ∫}Âéˇùã˙Ó.æ{ˇ^‹=È}ﬁ˝—©^?Ãz8˝h˝cÏ„¢'
O*û™?≠˝’¯◊f©ΩÙÏ†◊`œ≥àgèÜ∏C/ˇï˘ØO√œ©œ+F¥FÍG≠Gœå˘å›z±Ù≈Àåó”„Öø)˛∂˜ï—´ü~w˚Ωgb…ƒk—Îô?Jﬁ®æ9˙÷ˆmÁdË‰”wiÔ¶ßäﬁ´æ?ˆÅ˝°˚cÙ«ëÈÏO¯Oïüç?w|	¸Úx&mfÊﬂ˜ÑÛ˚2:Y~   	pHYs     öú   éIDATX	Ì–±É`≈`@Yá˝˜Hôe˛ ¬#∏8…◊∏{:}˚v›ZÎ{w»˝>Ô£Áêáü7èIœÚkO#a7i[ò˝§ë∞õ¥-Ã~“HÿM⁄f?i$Ï&m≥ü4vì∂ÖŸO	ªI€¬Ï'çÑ›§maˆìF¬n“∂0˚I#a7i[ò˝§ë∞õ¥-Ã˛Hiû’?d0w∞    IENDÆB`Ç
phina.namespace(() => {

  phina.define("Add", {
    superClass: "PostProcessingPass",

    weight: null,

    init: function (gl, w, h) {
      this.superInit();
      this.framebuffer = this.createFramebuffer(gl, w, h);
      this.drawable = this.createDrawable(gl, "add.fs", ["srcTextureA", "srcTextureB"]);
      this.weight = [1, 1];
    },

    setWeight: function (a, b) {
      this.weight[0] = a;
      this.weight[1] = b;
    },

    render: function (gl, previousTextureA, previousTextureB) {
      if (!this.isEnd) {
        this.framebuffer.bind(gl);
      } else {
        phigl.Framebuffer.unbind(gl);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      this.drawable.uniforms["srcTextureA"].setValue(0).setTexture(previousTextureA);
      this.drawable.uniforms["srcTextureB"].setValue(1).setTexture(previousTextureB);
      this.drawable.uniforms["weight"].setValue(this.weight);
      this.drawable.draw();
      phigl.Framebuffer.unbind(gl);

      this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
    },

  });

});

phina.namespace(() => {

  phina.define("Blur", {
    superClass: "PostProcessingPass",

    init: function (gl, w, h) {
      this.superInit();
      this.framebuffer = this.createFramebuffer(gl, w, h);
      this.drawable = this.createDrawable(gl, "blur.fs", ["srcTexture"]);
      this.direction = [0, 0];
    },

    setDirection: function (h, v) {
      this.direction[0] = h;
      this.direction[1] = v;
    },

    render: function (gl, previousTexture) {
      if (!this.isEnd) {
        this.framebuffer.bind(gl);
      } else {
        phigl.Framebuffer.unbind(gl);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.drawable.uniforms["srcTexture"].setValue(0).setTexture(previousTexture);
      this.drawable.uniforms["direction"].setValue(this.direction);
      this.drawable.draw();
      phigl.Framebuffer.unbind(gl);

      this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
    },

  });

});

phina.namespace(() => {

  phina.define("Emission", {
    superClass: "PostProcessingPass",

    next2: null,

    init: function (gl, w, h) {
      this.superInit();

      this.dark = Lighting();

      this.framebuffer = this.createFramebuffer(gl, w, h);
      this.drawable = this.createDrawable(gl);
    },

    setRenderer: function (renderer) {
      renderer.on("postrender", ({ gl, scene }) => {
        this.render(gl, scene, renderer);
      });
    },

    render: function (gl, scene, renderer) {
      const bkup = renderer.lighting;
      renderer.lighting = this.dark;

      if (!this.isEnd) {
        this.framebuffer.bind(gl);
      } else {
        phigl.Framebuffer.unbind(gl);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (let name in renderer.spriteArrays) {
        const array = renderer.spriteArrays[name];
        array.draw(gl, renderer.lighting);
      }
      renderer.renderChildren(scene);
      renderer.lighting = bkup;

      phigl.Framebuffer.unbind(gl);

      this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
    },

  });

});

phina.namespace(() => {

  phina.define("Merge", {
    superClass: "EventDispatcher",

    init: function () {
      this.superInit();
    },

    merge: function (passA, passB) {
      let count = 0;
      passA.on("postrender", ({ gl }) => {
        count += 1;
        if (count == 2) {
          this.flare("postrender", {
            gl,
            previousTextureA: passA.framebuffer.texture,
            previousTextureB: passB.framebuffer.texture,
          });
          count = 0;
        }
      });
      passB.on("postrender", ({ gl }) => {
        count += 1;
        if (count == 2) {
          this.flare("postrender", {
            gl,
            previousTextureA: passA.framebuffer.texture,
            previousTextureB: passB.framebuffer.texture,
          });
          count = 0;
        }
      });
      return this;
    },

    setNext: function (next) {
      this.on("postrender", ({ gl, previousTextureA, previousTextureB }) => {
        next.render(gl, previousTextureA, previousTextureB);
      });
      return next;
    },

  });

});

phina.namespace(() => {

  phina.define("PostProcessingPass", {
    superClass: "phina.util.EventDispatcher",

    enabled: false,
    isEnd: false,

    framebuffer: null,

    init: function () {
      this.superInit();
    },

    createFramebuffer: function (gl, w, h) {
      return phigl.Framebuffer(gl, w, h);
    },
    createDrawable: function (gl, fragmentShader = "passthrough.fs", uniforms = ["srcTexture"]) {
      const program = phigl.Program(gl)
        .attach("postprocessing.vs")
        .attach(fragmentShader)
        .link();
      return phigl.Drawable(gl)
        .setProgram(program)
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            -1, 1,
            1, 1,
            -1, -1,
            1, -1,
          ]
        }, {
          unitSize: 2,
          data: [
            0, 1,
            1, 1,
            0, 0,
            1, 0,
          ],
        },])
        .createVao()
        .declareUniforms(...uniforms);
    },

    render: function (gl, previousTexture) {
      this.flare("postrender", { gl, previousTexture });
    },

    setEnabled: function (v) {
      this.enabled = v;
      return this;
    },

    setNext: function (next) {
      this.on("postrender", ({ gl, previousTexture }) => {
        next.render(gl, previousTexture);
      });
      return next;
    },

  });

});

phina.namespace(() => {

  phina.define("StartPass", {
    superClass: "PostProcessingPass",

    init: function (gl, w, h) {
      this.superInit();
      this.framebuffer = this.createFramebuffer(gl, w, h);
    },

    setRenderer: function (renderer) {
      renderer.on("prerender", ({ gl }) => {
        this.framebuffer.bind(gl);
      });
      renderer.on("postrender", ({ gl, scene }) => {
        phigl.Framebuffer.unbind(gl);
        this.flare("postrender", { gl, previousTexture: this.framebuffer.texture });
      });
    },

  });

});

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
//# sourceMappingURL=bundle.js.map
