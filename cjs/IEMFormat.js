"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ADCFormat = require("./ADCFormat");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let IEMFormat = class IEMFormat {
  static getName() {
    return "Ambidecode XML Configuration Files";
  }

  static getDescription() {
    return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
  }

  static container_type() {
    return _ADCFormat.ContainerType.JSON;
  }

  static test(obj) {
    return false;
  }

  static parse(obj, filename, carry) {
    throw new Error("Method not implemented.");
  }

};
IEMFormat = __decorate([(0, _ADCFormat._static_implements)()], IEMFormat);
var _default = IEMFormat;
exports.default = _default;
//# sourceMappingURL=IEMFormat.js.map