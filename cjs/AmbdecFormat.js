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

let AmbdecFormat = class AmbdecFormat {
  static shortName() {
    return "ambdec";
  }

  static getName() {
    return "Ambdec Files";
  }

  static getDescription() {
    return "Ambdec Files";
  }

  static container_type() {
    return _ADCFormat.ContainerType.CSV;
  }

  static test(obj) {
    return true;
  }

  static parse(obj, filename, carry, opts) {}

  static fromADD(add) {
    return "";
  }

};
AmbdecFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbdecFormat);
var _default = AmbdecFormat;
exports.default = _default;
//# sourceMappingURL=AmbdecFormat.js.map