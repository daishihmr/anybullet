phina.namespace(function() {

  phina.define("phigl.Ibo32", {
    superClass: "phigl.Ibo",

    init: function(gl) {
      this.superInit(gl);
    },

    set: function(data) {
      var gl = this.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      this.length = data.length;
      return this;
    },

  });

});
