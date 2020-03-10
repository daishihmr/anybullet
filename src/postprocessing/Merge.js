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
