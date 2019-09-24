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

let AmbixConfigFormat = class AmbixConfigFormat {
  static shortName() {
    return "ambix";
  }
  /**
   * @returns {string} the name of the format
   */


  static getName() {
    return "AmbiX Configuration Files";
  }
  /**
   * @returns {string} a string describing the format
   */


  static getDescription() {
    return "Read and write configurations files for the AmbiX Plugin Suite by Matthias Kronlachner";
  }
  /**
   * @returns {ContainerType} the container type for this format
   */


  static container_type() {
    return _ADCFormat.ContainerType.CONFIG;
  }
  /**
   * test if an object can be interpreted by this format
   * @param obj object to test
   */


  static test(obj) {
    return false;
  }
  /**
   * parse the format
   * @param obj object to parse
   * @param filename filename of the parsed object
   * @param carry carried from the last iteration if the parser needs/accepts more than one file
   * @param options converter options
   */


  static parse(file, filename, carry, options) {
    console.log(file.data);
  }

  static fromADD(add, opts) {
    return "";
  }

};
AmbixConfigFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbixConfigFormat);
var _default = AmbixConfigFormat;
exports.default = _default;
;
//# sourceMappingURL=AmbixConfigFormat.js.map