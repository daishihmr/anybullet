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

        // 始点が円内にある場合は始点が衝突地点とする
        if ((ax - ox) * (ax - ox) + (ay - oy) * (ay - oy) <= r * r) return origin;

        // 円の中心点が原点になるように始点をオフセット
        ax -= ox;
        ay -= oy;

        // 係数tを算出
        const dotAV = ax * vx + ay * vy;
        const dotAA = ax * ax + ay * ay;
        let s = dotAV * dotAV - dotAA + r * r;
        if (Math.abs(s) < 0.000001) {
          s = 0.0; // 誤差修正
        }

        if (s < 0.0) return null; // 衝突していない

        const sq = Math.sqrt(s);
        const t1 = -dotAV - sq;
        const t2 = -dotAV + sq;

        // もしt1及びt2がマイナスだったら始点が
        // 円内にめり込んでいるのでエラーとする
        if (t1 < 0.0 || t2 < 0.0) return null;

        // 衝突座標を出力
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
          x: CANVAS_WIDTH * 0.5,
          y: CANVAS_HEIGHT * 1.2,
          controllable: false,
          muteki: true,
        })
        .wait(1000)
        .to({
          y: CANVAS_HEIGHT * 0.9,
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

  phina.define("GLInitScene", {
    superClass: "Scene",

    init: function () {
      this.superInit();
      this.one("enterframe", () => this.start());
    },

    start: function() {
      this.app.renderer.addSpriteArray("common", "common", 30000);
      this.exit();
    },
  });

});

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
          },
          fragmentShader: {
            "glsprite.fs": "./asset/shader/glsprite.fs",
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
          console.log("ショットたりない");
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
          console.log("弾たりない");
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
      // ショットvs敵
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
        // 敵vs自機
        for (let i = 0, il = this.enemies.length; i < il; i++) {
          const e = this.enemies[i];
          if (e.parent && e.type == "air") {
            if (CollisionHelper.hitTestCircleCircle(e, this.fighter)) {
              this.fighter.damage(e.power);
            }
          }
        }

        // 弾vs自機
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

      // 地上物移動
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

  // Z値
  // BG 20
  // Enemy 30
  // Fighter 40
  // Shot 50
  // Effect 60
  // Bullet 70～100
  // UI 100～

  phina.define("MainScene2", {
    superClass: "GLScene",

    init: function (params) {
      this.superInit();
      const renderer = params.app.renderer;

      const commonArray = renderer.getSpriteArray("common");

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
          bg: { className: "Background", arguments: { spriteArray: commonArray, speed: 1.0 } },
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
          console.log("ショットたりない");
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
          console.log("弾たりない");
        }
      };
      this.bulletmlManager = bulletmlManager;

      // stage
      this.seq.on("changescroll", ({ x, y, duration }) => {
        this.bg.tweener.clear().to({ vx: x, vy: y }, duration);
      });
      this.seq.on("checkpoint", () => {
        console.log("checkpoint");
      });

      this.one("enterframe", () => this.restart());

      const test = Enemy({
        bulletml: "test",
      })
        .setPosition(SCREEN_X + SCREEN_W * 0.5, SCREEN_Y + SCREEN_H * 0.5)
        .addChildTo(this);

      // setTimeout(() => {
      //   const bulletmlRoot = BulletML.parse(test.bulletml);
      //   bulletmlManager.run(test.bullet, bulletmlRoot);
      // }, 500);
      this.bg.vy = 1;
    },

    restart: function () {
      this.black.tweener.clear().fadeOut(500);
      // this.seq.restart();
      this.fighter.addChildTo(this);
      this.fighter.launch();
    },

    update: function () {
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

  const SPRITE_SCALE = 2;
  const SPRITE_COUNT = 100;

  const spaceship = new psg.Mask([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 1, -1,
    0, 0, 0, 0, 0, 0, 0, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, -1,
    0, 0, 1, 1, 0, 1, 1, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, -1,
    0, 0, 1, 1, 0, 1, 1, 1, -1,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 2, 2,
    0, 1, 1, 1, 1, 1, 1, 1, -1,
    0, 0, 0, 1, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ], 9, 18, true, false);

  phina.define("ShipTextureGenerator", {
    _static: {
      gen: function (scale, seed, params) {
        const R = Random(seed);
        const src = new psg.Sprite(spaceship, ({
          colored: true,
          saturation: 0.8,
          random: () => R.random(),
        }).$extend(params)).canvas;

        const result = Canvas().setSize(src.width * scale, src.height * scale);

        const srcCtx = src.getContext("2d");
        const srcData = srcCtx.getImageData(0, 0, src.width, src.height).data;
        for (let y = 0; y < src.height; y++) {
          for (let x = 0; x < src.width; x++) {
            const r = srcData[(y * src.width + x) * 4 + 0];
            const g = srcData[(y * src.width + x) * 4 + 1];
            const b = srcData[(y * src.width + x) * 4 + 2];
            const a = srcData[(y * src.width + x) * 4 + 3];
            result.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            result.fillRect(x * scale, y * scale, scale, scale);
          }
        }

        return result;
      }
    },
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
      }
    }
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
        this.fitScreen();
      }

      this.gl = this.domElement.getContext("webgl");
      this.renderer = GLAppRenderer(this.gl);
    },

    _draw: function () {
      const gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.renderer.render(this.currentScene);
      gl.flush();
    },

    fitScreen: function () {
      phina.graphics.Canvas.prototype.fitScreen.call(this);
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

    gl: null,
    context: null,

    init: function (gl) {
      gl.clearColor(0.1, 0.1, 0.2, 1.0);
      gl.clearDepth(1.0);

      // gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.depthFunc(gl.LEQUAL);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      this.gl = gl;
      this.context = GLContext2D();

      this.spriteArrays = {};
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
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.renderChildren(scene);
      for (let name in this.spriteArrays) {
        const array = this.spriteArrays[name];
        array.draw();
      }
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

      const context = this.context;

      obj._calcWorldMatrix && obj._calcWorldMatrix();
      obj._calcWorldAlpha && obj._calcWorldAlpha();

      context.globalAlpha = obj._worldAlpha;
      context.globalCompositeOperation = obj.blendMode;

      let tempChildren = obj.children.slice();
      for (let i = 0, len = tempChildren.length; i < len; ++i) {
        this.renderObject(tempChildren[i]);
      }
    },
  });

  phina.define("GLContext2D", {
    init: function () {
      this.globalAlpha = 1.0;
      this.globalCompositeOperation = "source-over";
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

  phina.define("GLSpriteArray", {

    init: function (gl, atlas, max, options) {
      this.gl = gl;
      this.indexPool = Array.range(0, max);
      this.instances = [];

      this.atlas = phina.asset.AssetManager.get("atlas", atlas);
      this.image = this.atlas.images[Object.keys(this.atlas.images)[0]];
      this.texture = phigl.Texture(gl, this.image);
      this.max = max;
      this.options = ({}).$extend(GLSpriteArray.defaults, options);

      const ext = phigl.Extensions.getInstancedArrays(gl);

      const program = phigl.Program(gl)
        .attach("glsprite.vs")
        .attach("glsprite.fs")
        .link();

      this.drawable = phigl.InstancedDrawable(gl, ext)
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
        .declareInstanceAttributes(
          "instanceActive",
          "instanceUvMatrix0",
          "instanceUvMatrix1",
          "instanceUvMatrix2",
          "instancePosition",
          "instanceSize",
          "instanceAlphaEnabled",
          "instanceAlpha",
          "instanceBrightness",
          "cameraMatrix0",
          "cameraMatrix1",
          "cameraMatrix2",
        )
        .declareUniforms("screenSize", "texture");

      this.array = [];
      for (let i = 0; i < max; i++) {
        Array.prototype.push.apply(this.array, [
          // active
          0,
          // uv matrix
          1, 0,
          0, 1,
          0, 0,
          // sprite position
          0, 0, 0,
          // sprite size
          0, 0,
          // sprite alpha enabled
          0,
          // sprite alpha
          1,
          // sprite brightness
          1,
          // camera matrix
          1, 0,
          0, 1,
          0, 0,
        ]);
      }
      this.drawable.setInstanceAttributeData(this.array);
    },

    draw: function () {
      const gl = this.gl;
      const drawable = this.drawable;

      if (this.options.depthEnabled) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }

      if (this.options.blendMode === "source-over") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else if (this.options.blendMode === "lighter") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
      } else {
        gl.disable(gl.BLEND);
      }

      for (let i = 0, len = this.instances.length; i < len; i++) {
        this.instances[i].updateAttributes(this.array);
      }

      drawable.uniforms["screenSize"].setValue([CANVAS_WIDTH, CANVAS_HEIGHT]);
      drawable.uniforms["texture"].setValue(1).setTexture(this.texture);

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

      this.setImage(params.image);

      this.spriteArray.instances.push(this);

      this.z = 0;
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
      const m = this._worldMatrix;

      const size = 21;

      // active
      array[idx * size + 0] = (this.parent && this.visible) ? 1 : 0;
      if (this.parent) {
        // uv matrix
        array[idx * size + 1] = uvm.m00;
        array[idx * size + 2] = uvm.m10;
        array[idx * size + 3] = uvm.m01;
        array[idx * size + 4] = uvm.m11;
        array[idx * size + 5] = uvm.m02;
        array[idx * size + 6] = uvm.m12;
        // sprite position
        array[idx * size + 7] = -this.width * this.originX;
        array[idx * size + 8] = -this.height * this.originY;
        array[idx * size + 9] = this.z;
        // sprite size
        array[idx * size + 10] = this.width;
        array[idx * size + 11] = this.height;
        // sprite alpha enabled
        array[idx * size + 12] = this.alphaEnabled ? 1 : 0;
        // sprite alpha
        array[idx * size + 13] = this._worldAlpha;
        // sprite brightness
        array[idx * size + 14] = this.brightness;
        // camera matrix
        array[idx * size + 15] = m.m00;
        array[idx * size + 16] = m.m10;
        array[idx * size + 17] = m.m01;
        array[idx * size + 18] = m.m11;
        array[idx * size + 19] = m.m02;
        array[idx * size + 20] = m.m12;
      }
    },

    _static: {
      defaults: {
        alphaEnabled: false,
        brightness: 1.0,
      },
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
