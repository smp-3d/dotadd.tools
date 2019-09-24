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

let ADDFormat = class ADDFormat {
  static shortName() {
    return "add";
  }

  static getName() {
    return "Ambisonic Decoder Description";
  }

  static getDescription() {
    return "Universal file format to describe Ambisonic decoders";
  }

  static container_type() {
    return _ADCFormat.ContainerType.JSON;
  }

  static test(obj) {
    return obj.hasOwnProperty("name") && obj.hasOwnProperty("decoder") && obj.hasOwnProperty("revision");
  }

  static parse(obj, filename, carry, opts) {
    let add = new _dotadd.ADD(obj);
    if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
  }

  static fromADD(add, opts) {
    let prettify = opts.use('prettify');
    if (prettify) return JSON.stringify(add.export(), null, 4);else return add.export().serialize();
  }

};
ADDFormat = __decorate([(0, _ADCFormat._static_implements)()], ADDFormat);
var _default = ADDFormat;
exports.default = _default;
//# sourceMappingURL=ADDFormat.js.map