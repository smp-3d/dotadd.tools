(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./ADCFormat", "./Converter", "dotadd.js"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./ADCFormat"), require("./Converter"), require("dotadd.js"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ADCFormat, global.Converter, global.dotadd);
    global.AmbidecodeSettings = mod.exports;
  }
})(this, function (_exports, _ADCFormat, _Converter, _dotadd) {
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

  var AmbidecodeSettings =
  /*#__PURE__*/
  function () {
    function AmbidecodeSettings() {
      _classCallCheck(this, AmbidecodeSettings);
    }

    _createClass(AmbidecodeSettings, null, [{
      key: "getName",
      value: function getName() {
        return "Ambidecode XML Settings Files";
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
        return obj.hasOwnProperty("ambidecode-settings");
      }
    }, {
      key: "parse",
      value: function parse(obj, filename, carry, opts) {
        var incomplete = true;
        var add = new _dotadd.ADD();
        var ambset = obj['ambidecode-settings'];
        var order = ambset.order;
        var mat_width = Math.pow(order + 1, 2);

        if (carry.incomplete_results.length) {
          add = carry.incomplete_results.shift();
          incomplete = false;
        }

        if (!(ambset.type == 'SN3D' || ambset.type == 'N3D')) throw new Error("Unexpected normalisation: " + ambset.type);
        if (!add.decoder.matrices.length) add.addMatrix(new _dotadd.Matrix(0, ambset.type, []));else {
          if (add.decoder.matrices[0].getNormalisation() && add.decoder.matrices[0].getNormalisation() != 'unknown') {
            if (add.decoder.matrices[0].getNormalisation() != ambset.type.toLowerCase()) carry.messages.push(new _Converter.ParserMessage("Normalisation mismatch, expected ".concat(add.decoder.matrices[0].getNormalisation(), " but found ").concat(ambset.type), _Converter.ParserMessageLevels.err));
          } else {
            add.decoder.matrices[0].setNormalisation(ambset.type.toLowerCase());
          }
        }

        for (var i in ambset.speaker) {
          if (!(ambset.speaker[i].position['@_type'] === 'aed')) throw new Error('Unsupported coordinate type');
          var coords = ambset.speaker[i].position['#text'].split(' ');
          add.addOutput(new _dotadd.OutputChannel("speaker_".concat(i), 'spk', {
            coords: new _dotadd.AEDCoord(coords[0], coords[1], coords[2])
          }));
          var mix_arr = new Array(ambset.speaker.length).fill(0);
          mix_arr[Number.parseInt(i)] = ambset.speaker[i].gain;
          add.decoder.output.matrix.push(mix_arr);
        }

        console.log(JSON.stringify(add, null, 4));
        if (incomplete) carry.incomplete_results.push(add);else carry.results.push(add);
      }
    }]);

    return AmbidecodeSettings;
  }();

  AmbidecodeSettings = __decorate([(0, _ADCFormat._static_implements)()], AmbidecodeSettings);
  var _default = AmbidecodeSettings;
  _exports.default = _default;
});