(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./ADCFormat", "dotadd.js"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./ADCFormat"), require("dotadd.js"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ADCFormat, global.dotadd);
    global.AmbidecodeCoefs = mod.exports;
  }
})(this, function (_exports, _ADCFormat, _dotadd) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
      if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  var AmbidecodeCoefs =
  /*#__PURE__*/
  function () {
    function AmbidecodeCoefs() {
      _classCallCheck(this, AmbidecodeCoefs);
    }

    _createClass(AmbidecodeCoefs, null, [{
      key: "getName",
      value: function getName() {
        return "Ambidecode XML Configuration Files";
      }
    }, {
      key: "getDescription",
      value: function getDescription() {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
      }
    }, {
      key: "container_type",
      value: function container_type() {
        return _ADCFormat.ContainerType.XML;
      }
    }, {
      key: "test",
      value: function test(obj) {
        return obj.hasOwnProperty("ambidecode-coefs");
      }
    }, {
      key: "parse",
      value: function parse(obj, filename, carry, opts) {
        var add = new _dotadd.ADD();
      }
    }]);

    return AmbidecodeCoefs;
  }();

  AmbidecodeCoefs = __decorate([(0, _ADCFormat._static_implements)()], AmbidecodeCoefs);
  var _default = AmbidecodeCoefs;
  _exports.default = _default;
});