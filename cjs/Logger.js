"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

class Logger {
  static log(...any) {
    let self = Logger;
    if (self.prototype.verbose) console.log(...any);
  }

}

exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map