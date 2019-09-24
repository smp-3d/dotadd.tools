"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dotadd = require("dotadd.js");

var _ADCFormat = require("./ADCFormat");

var Papa = _interopRequireWildcard(require("papaparse"));

var _Util = require("./Util");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let CSVFormat = class CSVFormat {
  static shortName() {
    return "csv";
  }

  static getName() {
    return "CSV Files";
  }

  static getDescription() {
    return "Basic CSV Files";
  }

  static container_type() {
    return _ADCFormat.ContainerType.CSV;
  }

  static test(obj) {
    return true;
  }

  static parse(obj, filename, carry, opts) {
    if (obj.errors.length) throw new _Util.ParseError(filename, "Could not parse CSV");
    let add = new _dotadd.ADD({
      name: "Ambisonic Decoder Description parsed from CSV File"
    });
    add.createDefaultMetadata();
    add.addMatrix(new _dotadd.Matrix('unknown', obj.data.map(arr => arr.map(num => Number.parseFloat(num)))));
    add.createDefaultOutputs();
    carry.incomplete_results.push(add);
  }

  static fromADD(add) {
    let len = add.decoder.matrices[0].numCoeffs();
    let equal = add.decoder.matrices.reduce((eq, mat) => mat.numCoeffs() == len, true);
    let output_arr = [];

    if (equal) {
      for (let mat of add.decoder.matrices) output_arr.push(...mat.matrix);
    } else output_arr = add.decoder.matrices[0].matrix;

    return Papa.unparse(output_arr);
  }

};
CSVFormat = __decorate([(0, _ADCFormat._static_implements)()], CSVFormat);
var _default = CSVFormat;
exports.default = _default;
//# sourceMappingURL=CSVFormat.js.map