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
