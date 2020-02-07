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
