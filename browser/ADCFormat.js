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
    global.ADCFormat = mod.exports;
  }
})(this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports._static_implements = _static_implements;
  _exports.ContainerType = void 0;
  var ContainerType;
  _exports.ContainerType = ContainerType;

  (function (ContainerType) {
    ContainerType[ContainerType["XML"] = 0] = "XML";
    ContainerType[ContainerType["JSON"] = 1] = "JSON";
  })(ContainerType || (_exports.ContainerType = ContainerType = {}));
  /* class decorator */


  function _static_implements() {
    return function (constructor) {
      constructor;
    };
  }

  ;
});