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
