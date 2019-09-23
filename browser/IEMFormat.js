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
    global.IEMFormat = mod.exports;
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

  var IEMFormat =
  /*#__PURE__*/
  function () {
    function IEMFormat() {
      _classCallCheck(this, IEMFormat);
    }

    _createClass(IEMFormat, null, [{
      key: "shortName",
      value: function shortName() {
        return "iem";
      }
    }, {
      key: "getName",
      value: function getName() {
        return "IEM AllRad Decoder Configuration Files";
      }
    }, {
      key: "getDescription",
      value: function getDescription() {
        return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
      }
    }, {
      key: "container_type",
      value: function container_type() {
        return _ADCFormat.ContainerType.JSON;
      }
    }, {
      key: "test",
      value: function test(obj) {
        return obj.hasOwnProperty('Name') && obj.hasOwnProperty("Description") && obj.hasOwnProperty("Decoder") && obj.Decoder.hasOwnProperty("Weights");
      }
    }, {
      key: "parse",
      value: function parse(obj, filename, carry) {
        var add = new _dotadd.ADD({
          name: obj.Name,
          description: obj.Description,
          author: "IEM Graz"
        });
        var date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();
        var ampm = date_str.slice(-2);
        var date = new Date(date_str.slice(0, -2));
        date.setHours(date.getHours() + (ampm == 'pm' ? 12 : 0));
        add.setDate(date);
        var norm = obj.Decoder.ExpectedInputNormalization;
        add.addMatrix(new _dotadd.Matrix(0, norm, obj.Decoder.Matrix));
        add.repair();
        if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
      }
    }, {
      key: "fromADD",
      value: function fromADD(add) {
        return "";
      }
    }]);

    return IEMFormat;
  }();

  IEMFormat = __decorate([(0, _ADCFormat._static_implements)()], IEMFormat);
  var _default = IEMFormat;
  _exports.default = _default;
});