"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Converter = exports.ConverterOptions = exports.ConverterOption = exports.ConvertableTextFile = exports.ParseResults = exports.ParserMessage = exports.ParserMessageLevels = void 0;

var _ADCFormat = require("./ADCFormat");

var _AmbidecodeCoefs = _interopRequireDefault(require("./AmbidecodeCoefs"));

var _AmbidecodeSettings = _interopRequireDefault(require("./AmbidecodeSettings"));

var _IEMFormat = _interopRequireDefault(require("./IEMFormat"));

var _ADDFormat = _interopRequireDefault(require("./ADDFormat"));

var _fastXmlParser = require("fast-xml-parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let formats = [_ADDFormat.default, _AmbidecodeCoefs.default, _AmbidecodeSettings.default, _IEMFormat.default];
var ParserMessageLevels;
exports.ParserMessageLevels = ParserMessageLevels;

(function (ParserMessageLevels) {
  ParserMessageLevels[ParserMessageLevels["note"] = 0] = "note";
  ParserMessageLevels[ParserMessageLevels["warn"] = 1] = "warn";
  ParserMessageLevels[ParserMessageLevels["err"] = 2] = "err";
})(ParserMessageLevels || (exports.ParserMessageLevels = ParserMessageLevels = {}));

class ParserMessage {
  constructor(mess, level) {
    this.message = mess;
    this.level = level;
  }

}

exports.ParserMessage = ParserMessage;

class ParseResults {
  constructor() {
    this.results = [];
    this.incomplete_results = [];
    this.messages = [];
  }

}

exports.ParseResults = ParseResults;

class ConvertableTextFile {
  constructor(fname, data) {
    this.filename = fname;
    this.data = data;
  }

}

exports.ConvertableTextFile = ConvertableTextFile;

class ConverterOption {
  constructor(name, value) {
    this.used = false;
    this.name = name;
    this.value = value;
  }

  type() {
    return typeof this.value;
  }

  peek() {
    return this.value;
  }

  wasUsed() {
    return this.used;
  }

  use() {
    this.used = true;
    return this.value;
  }

}

exports.ConverterOption = ConverterOption;

class ConverterOptions {
  constructor(...args) {
    this.options = [];
    this.options = args;
  }

  has(name) {
    return this.options.find(opt => opt.name === name) != undefined;
  }

  get(name) {
    return this.options.find(opt => opt.name === name);
  }

  use(name) {
    let opt = this.get(name);
    if (opt) return opt.use();
  }

  getUnused() {
    return this.options.reduce((carry, current) => {
      !current.used ? carry.push(current) : null;
      return carry;
    }, []);
  }

}

exports.ConverterOptions = ConverterOptions;
const Converter = {
  convert_string(files, options) {
    let results = new ParseResults();

    for (let file of files) {
      let ftype = file.filename.slice((file.filename.lastIndexOf(".") - 1 >>> 0) + 2);

      if (!(ftype === 'xml' || ftype === 'json' || ftype === 'add')) {
        if (file.data.charAt(0) === '<') ftype = 'xml';else if (file.data.charAt(0) === '{' || file.data.charAt(0) === '[') ftype = 'json';
      }

      switch (ftype) {
        case 'json':
          this._do_parse_json(file, results, options);

          break;

        case 'xml':
          this._do_parse_xml(file, results, options);

          break;

        case 'add':
          this._do_parse_add(file, results, options);

          break;
      }
    }

    return results;
  },

  convert_binary(filename, data, options) {},

  list_formats() {},

  _do_parse_json(file, carry, opts) {
    this._do_parse_native(file, carry, opts, JSON.parse(file.data), _ADCFormat.ContainerType.JSON);
  },

  _do_parse_xml(file, carry, opts) {
    this._do_parse_native(file, carry, opts, (0, _fastXmlParser.parse)(file.data, {
      ignoreAttributes: false
    }), _ADCFormat.ContainerType.XML);
  },

  _do_parse_add(file, carry, opts) {
    _ADDFormat.default.parse(JSON.parse(file.data), file.filename, carry, opts);
  },

  _do_parse_native(file, carry, opts, obj, container_type) {
    let parsers_to_try = [];
    let output_file = opts.use('output');
    if (output_file) console.log('output file: ' + output_file);
    console.log();
    console.log("Converting: " + file.filename);

    for (let format of formats) {
      if (format.container_type() === container_type && format.test(obj)) parsers_to_try.push(format);
    }

    console.log('Matched the following parsers: ');
    parsers_to_try.forEach(p => console.log(p.name));
    parsers_to_try.forEach(parser => parser.parse(obj, file.filename, carry, opts));
  }

};
exports.Converter = Converter;
//# sourceMappingURL=Converter.js.map