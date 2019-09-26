(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./ADCFormat", "./Converter", "dotadd.js", "./Util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./ADCFormat"), require("./Converter"), require("dotadd.js"), require("./Util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ADCFormat, global.Converter, global.dotadd, global.Util);
    global.IEMFormat = mod.exports;
  }
})(this, function (_exports, _ADCFormat, _Converter, _dotadd, _Util) {
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
        if (!obj.LoudspeakerLayout) throw new _Util.ParseError(filename, "No Loudspeaker Layout found.");
        if (!obj.Decoder) throw new _Util.ParseError(filename, "No Decoder found in File");
        var date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();
        var ampm = date_str.slice(-2);
        var date = new Date(date_str.slice(0, -2));
        date.setHours(date.getHours() + (ampm == 'pm' ? 12 : 0));

        try {
          add.setDate(date);
        } catch (e) {
          add.setDate(new Date(Date.now()).toISOString());
          carry.messages.push(new _Converter.ParserMessage("Could not read Date value from description string", _Converter.ParserMessageLevels.warn));
        }

        var mat = new _dotadd.Matrix(obj.Decoder.ExpectedInputNormalization, obj.Decoder.Matrix);
        if (obj.Decoder.WeightsAlreadyApplied && obj.Decoder.Weights != "none") mat.setWeighting(obj.Decoder.Weights);
        add.addMatrix(mat);
        var num_outputs = obj.LoudspeakerLayout.Loudspeakers.reduce(function (val, spk) {
          return val + +!spk.IsImaginary;
        }, 0);
        var num_imags = obj.LoudspeakerLayout.Loudspeakers.reduce(function (val, spk) {
          return val + spk.IsImaginary;
        }, 0);
        add.decoder.output.summing_matrix = [];

        for (var i = 0; i < obj.LoudspeakerLayout.Loudspeakers.length; ++i) {
          add.decoder.output.summing_matrix.push(new Array(num_outputs).fill(0));
        }

        obj.LoudspeakerLayout.Loudspeakers.forEach(function (speaker, index) {
          return add.addOutput(new _dotadd.OutputChannel("".concat(obj.LoudspeakerLayout.Name.length ? obj.LoudspeakerLayout.Name : "spk", " ").concat(index).concat(speaker.IsImaginary ? " [IMAG]" : ""), 'spk', new _dotadd.AEDCoord(speaker.Azimuth, speaker.Elevation, speaker.Radius)));
        });
        obj.Decoder.Routing.forEach(function (ch, index) {
          add.decoder.output.summing_matrix[ch - 1][index] = obj.LoudspeakerLayout.Loudspeakers[ch - 1].Gain;
        });
        if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
      }
    }, {
      key: "fromADD",
      value: function fromADD(add, opts) {
        var iem = {
          Name: add.name,
          Description: add.description,
          Decoder: {
            Name: add.name,
            Description: add.description,
            ExpectedInputNormalization: add.decoder.matrices[0].getNormalization(),
            Weights: add.decoder.matrices[0].weights ? add.decoder.matrices[0].weights : "none",
            WeightsAlreadyApplied: add.decoder.matrices[0].weights ? true : false,
            Matrix: [],
            Routing: []
          },
          LoudspeakerLayout: {
            Name: add.name + '_layout',
            Loudspeakers: []
          }
        };
        add.decoder.output.channels.forEach(function (ch, i) {
          var spk = {
            Azimuth: ch.coords ? ch.coords.a || 0 : 0,
            Elevation: ch.coords ? ch.coords.e || 0 : 0,
            Radius: ch.coords ? ch.coords.d || 1 : 0,
            IsImaginary: isImag(add, i),
            Channel: i + 1,
            Gain: gainForChannel(add, i)
          };
          if (!isImag(add, i)) iem.Decoder.Routing.push(i + 1);
          iem.LoudspeakerLayout.Loudspeakers.push(spk);
        });
        removeNullSpeakers(add);
        iem.Decoder.Matrix = add.decoder.matrices[0].matrix;
        var prettify = opts.use('prettify');
        if (prettify) return JSON.stringify(iem, null, 4);else return JSON.stringify(iem);
      }
    }]);

    return IEMFormat;
  }();

  IEMFormat = __decorate([(0, _ADCFormat._static_implements)()], IEMFormat);
  var _default = IEMFormat;
  _exports.default = _default;

  function removeNullSpeakers(add) {
    var new_chs = [];
    add.decoder.matrices[0].matrix.forEach(function (ch, i) {
      if (chIsImag(add, i)) new_chs.push(ch);
    });
    add.decoder.matrices[0].matrix = new_chs;
  }

  function summing_matrixWidth(add) {
    return add.decoder.output.summing_matrix[0].length;
  }

  function isImag(add, index) {
    return add.decoder.output.summing_matrix[index].reduce(function (is_null, val) {
      return is_null && val == 0;
    }, true);
  }

  function chIsImag(add, index) {
    return !add.decoder.matrices[0].matrix[index].reduce(function (is_null, val) {
      return is_null && val == 0;
    }, true);
  }

  function gainForChannel(add, index) {
    return add.decoder.output.summing_matrix[index].reduce(function (val, arr) {
      return val + arr;
    }, 0);
  }
});