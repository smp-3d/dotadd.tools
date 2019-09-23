"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExportError = exports.ParseError = void 0;

class ParseError {
  constructor(filename, message) {
    this.file = filename;
    this.message = message;
  }

}

exports.ParseError = ParseError;

class ExportError {
  constructor(filename, message) {
    this.file = filename;
    this.message = message;
  }

}

exports.ExportError = ExportError;
//# sourceMappingURL=Util.js.map