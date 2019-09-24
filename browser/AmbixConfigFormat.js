(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./ADCFormat"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./ADCFormat"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ADCFormat);
    global.AmbixConfigFormat = mod.exports;
  }
})(this, function (_exports, _ADCFormat) {
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

  var AmbixConfigFormat =
  /*#__PURE__*/
  function () {
    function AmbixConfigFormat() {
      _classCallCheck(this, AmbixConfigFormat);
    }

    _createClass(AmbixConfigFormat, null, [{
      key: "shortName",
      value: function shortName() {
        return "ambix";
      }
      /**
       * @returns {string} the name of the format
       */

    }, {
      key: "getName",
      value: function getName() {
        return "AmbiX Configuration Files";
      }
      /**
       * @returns {string} a string describing the format
       */

    }, {
      key: "getDescription",
      value: function getDescription() {
        return "Read and write configurations files for the AmbiX Plugin Suite by Matthias Kronlachner";
      }
      /**
       * @returns {ContainerType} the container type for this format
       */

    }, {
      key: "container_type",
      value: function container_type() {
        return _ADCFormat.ContainerType.CONFIG;
      }
      /**
       * test if an object can be interpreted by this format
       * @param obj object to test
       */

    }, {
      key: "test",
      value: function test(obj) {
        return false;
      }
      /**
       * parse the format
       * @param obj object to parse
       * @param filename filename of the parsed object
       * @param carry carried from the last iteration if the parser needs/accepts more than one file
       * @param options converter options
       */

    }, {
      key: "parse",
      value: function parse(file, filename, carry, options) {
        console.log(file.data);
      }
    }, {
      key: "fromADD",
      value: function fromADD(add, opts) {
        return "";
      }
    }]);

    return AmbixConfigFormat;
  }();

  AmbixConfigFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbixConfigFormat);
  var _default = AmbixConfigFormat;
  _exports.default = _default;
  ;
});