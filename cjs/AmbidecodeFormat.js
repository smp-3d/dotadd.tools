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

let AmbidecodeFormat = class AmbidecodeFormat {
  static getName() {
    return "Ambidecode XML Configuration Files";
  }

  static getDescription() {
    return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP. Consists of a settings and a coefficents file";
  }

  static container_type() {
    return _ADCFormat.ContainerType.XML;
  }

  static test(obj) {
    return obj.hasOwnProperty("ambidecode-coefs") || obj.hasOwnProperty("ambidecode-settings");
  }

  static parse(obj, filename, carry, opts) {
    let add = new _dotadd.ADD();
    let fnorm_opt = opts.use('norm');
  }

};
AmbidecodeFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbidecodeFormat);
var _default = AmbidecodeFormat;
exports.default = _default;
//# sourceMappingURL=AmbidecodeFormat.js.map