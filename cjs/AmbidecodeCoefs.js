"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ADCFormat = require("./ADCFormat");

var _dotadd = require("dotadd.js");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let AmbidecodeCoefs = class AmbidecodeCoefs {
  static getName() {
    return "Ambidecode XML Configuration Files";
  }

  static getDescription() {
    return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
  }

  static container_type() {
    return _ADCFormat.ContainerType.XML;
  }

  static test(obj) {
    return obj.hasOwnProperty("ambidecode-coefs");
  }

  static parse(obj, filename, carry, opts) {
    let incomplete = true;
    let add = new _dotadd.ADD();
    let ambc = obj['ambidecode-coefs'];

    if (carry.incomplete_results.length) {
      add = carry.incomplete_results.shift();
      incomplete = false;
    }

    if (!ambc.speaker[0].coef[0].hasOwnProperty("@_ACN")) throw new Error("Unsupported channel ordering in " + filename);
    if (!add.decoder.matrices.length) add.addMatrix(new _dotadd.Matrix(0, 'unknown', []));else add.decoder.matrices[0].matrix = [];
    add.decoder.matrices[0].matrix = ambc.speaker.map(spk => spk.coef.map(cf => cf['#text']));
    if (incomplete) carry.incomplete_results.push(add);else carry.results.push(add);
    console.log(JSON.stringify(add, null, 4));
  }

};
AmbidecodeCoefs = __decorate([(0, _ADCFormat._static_implements)()], AmbidecodeCoefs);
var _default = AmbidecodeCoefs;
exports.default = _default;
//# sourceMappingURL=AmbidecodeCoefs.js.map