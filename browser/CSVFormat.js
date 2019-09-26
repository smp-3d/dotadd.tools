(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "dotadd.js", "./ADCFormat", "papaparse", "./Util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("dotadd.js"), require("./ADCFormat"), require("papaparse"), require("./Util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.dotadd, global.ADCFormat, global.papaparse, global.Util);
    global.CSVFormat = mod.exports;
  }
})(this, function (_exports, _dotadd, _ADCFormat, Papa, _Util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  Papa = _interopRequireWildcard(Papa);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

  var CSVFormat =
  /*#__PURE__*/
  function () {
    function CSVFormat() {
      _classCallCheck(this, CSVFormat);
    }

    _createClass(CSVFormat, null, [{
      key: "shortName",
      value: function shortName() {
        return "csv";
      }
    }, {
      key: "getName",
      value: function getName() {
        return "CSV Files";
      }
    }, {
      key: "getDescription",
      value: function getDescription() {
        return "Basic CSV Files";
      }
    }, {
      key: "container_type",
      value: function container_type() {
        return _ADCFormat.ContainerType.CSV;
      }
    }, {
      key: "test",
      value: function test(obj) {
        return true;
      }
    }, {
      key: "parse",
      value: function parse(obj, filename, carry, opts) {
        if (obj.errors.length) throw new _Util.ParseError(filename, "Could not parse CSV");
        var add = new _dotadd.ADD({
          name: "Ambisonic Decoder Description parsed from CSV File"
        });
        add.createDefaultMetadata();
        console.log(obj.data);
        obj.data = obj.data.filter(function (arr) {
          return arr[0] && arr[0].length;
        });
        add.addMatrix(new _dotadd.Matrix('unknown', obj.data.map(function (arr) {
          return arr.map(function (num) {
            return Number.parseFloat(num);
          });
        })));
        add.createDefaultOutputs();
        carry.incomplete_results.push(add);
      }
    }, {
      key: "fromADD",
      value: function fromADD(add) {
        var len = add.decoder.matrices[0].numCoeffs();
        var equal = add.decoder.matrices.reduce(function (eq, mat) {
          return mat.numCoeffs() == len;
        }, true);
        var output_arr = [];

        if (equal) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = add.decoder.matrices[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _output_arr;

              var mat = _step.value;

              (_output_arr = output_arr).push.apply(_output_arr, _toConsumableArray(mat.matrix));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else output_arr = add.decoder.matrices[0].matrix;

        return Papa.unparse(output_arr);
      }
    }]);

    return CSVFormat;
  }();

  CSVFormat = __decorate([(0, _ADCFormat._static_implements)()], CSVFormat);
  var _default = CSVFormat;
  _exports.default = _default;
});