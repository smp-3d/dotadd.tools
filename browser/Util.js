(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.Util = mod.exports;
  }
})(this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ExportError = _exports.ParseError = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var ParseError = function ParseError(filename, message) {
    _classCallCheck(this, ParseError);

    this.file = filename;
    this.message = message;
  };

  _exports.ParseError = ParseError;

  var ExportError = function ExportError(filename, message) {
    _classCallCheck(this, ExportError);

    this.file = filename;
    this.message = message;
  };

  _exports.ExportError = ExportError;
});