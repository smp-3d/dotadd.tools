"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Converter = exports.ConverterOptions = exports.ConverterOption = exports.ConvertableTextFile = exports.ParseResults = exports.ParserMessage = exports.ParserMessageLevels = void 0;

var _ADCFormat = require("./ADCFormat");

var _Logger = require("./Logger");

var _fastXmlParser = require("fast-xml-parser");

var Papa = _interopRequireWildcard(require("papaparse"));

var _AmbidecodeCoefs = _interopRequireDefault(require("./AmbidecodeCoefs"));

var _AmbidecodeSettings = _interopRequireDefault(require("./AmbidecodeSettings"));

var _IEMFormat = _interopRequireDefault(require("./IEMFormat"));

var _ADDFormat = _interopRequireDefault(require("./ADDFormat"));

var _CSVFormat = _interopRequireDefault(require("./CSVFormat"));

var _AmbdecFormat = _interopRequireDefault(require("./AmbdecFormat"));

var _AmbixConfigFormat = _interopRequireDefault(require("./AmbixConfigFormat"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function containerTypeToString(ty) {
  switch (ty) {
    case _ADCFormat.ContainerType.CSV:
      return "csv";

    case _ADCFormat.ContainerType.JSON:
      return "json";

    case _ADCFormat.ContainerType.XML:
      return "xml";

    case _ADCFormat.ContainerType.AMBDEC:
      return "ambdec";

    case _ADCFormat.ContainerType.CONFIG:
      return "config";
  }
}

let formats = [_ADDFormat.default, _AmbidecodeCoefs.default, _AmbidecodeSettings.default, _IEMFormat.default, _CSVFormat.default, _AmbdecFormat.default, _AmbixConfigFormat.default];
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
    this.output_files = [];
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

      _Logger.Logger.log("Processing file: " + file.filename);

      _Logger.Logger.log("Filetype:        " + ftype);

      if (!(ftype === 'xml' || ftype === 'json' || ftype === 'add')) {
        if (file.data.charAt(0) === '<') ftype = 'xml';else if (file.data.charAt(0) === '{' || file.data.charAt(0) === '[') ftype = 'json';
      }

      file.filename = file.filename.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.');

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

        case 'csv':
          this._do_parse_csv(file, results, options);

          break;

        case 'ambdec':
          this._do_parse_ambdec(file, results, options);

          break;

        case 'config':
          this._do_parse_ambix_config(file, results, options);

          break;
      }
    }

    _Logger.Logger.log("Applying command line options");

    this._do_apply_options(results, options);

    this._do_convert(results, options);

    return results;
  },

  _do_convert(carry, opts) {
    let ofopt = opts.use('format');
    let output = opts.use('output');
    let fileext = "",
        format;
    if (output) fileext = output.slice((output.lastIndexOf(".") - 1 >>> 0) + 2);
    if (ofopt) format = ofopt;else if (fileext.length) format = fileext;else format = 'add';
    let converter = formats.find(frm => frm.shortName() == format);

    if (converter) {
      _Logger.Logger.log("Using '" + converter.getName() + "' exporter");

      carry.results.forEach(res => {
        let data = converter.fromADD(res, opts);

        _Logger.Logger.log("Producing output: '" + res.name + "', format: '" + format + "', container: " + containerTypeToString(converter.container_type()));

        carry.output_files.push({
          name: res.name,
          format: format,
          container: containerTypeToString(converter.container_type()),
          data: data
        });
      });
    } else throw new Error("Exporter '" + format + "' not found");
  },

  _do_apply_options(carry, opts) {
    let mopts = {
      description: opts.use('description'),
      name: opts.use('name'),
      author: opts.use('author'),
      version: opts.use('version'),
      norm: opts.use('norm'),
      renormalize: opts.use('reNorm')
    };
    carry.results.forEach(res => this._do_apply_options_impl(res, mopts));
    carry.incomplete_results.forEach(res => this._do_apply_options_impl(res, mopts));
    let restash = [];

    while (carry.incomplete_results.length) {
      let add = carry.incomplete_results.shift();

      if (add) {
        _Logger.Logger.log("reevaluating ADD '" + add.name + "'");

        if (add.valid()) {
          _Logger.Logger.log("is valid now, appending to valid results");

          carry.results.push(add);
        } else {
          restash.push(add);

          _Logger.Logger.log("still invalid");
        }
      }
    }

    carry.incomplete_results.push(...restash);
  },

  _do_apply_options_impl(add, opts) {
    if (opts.author && typeof opts.author == 'string') {
      _Logger.Logger.log("setting author: " + opts.author);

      add.setAuthor(opts.author);
    }

    if (opts.name && typeof opts.name == 'string') {
      _Logger.Logger.log("setting name: " + opts.name);

      add.setName(opts.name);
    }

    if (opts.description && typeof opts.description == 'string') {
      _Logger.Logger.log("setting description: " + opts.description);

      add.setDescription(opts.description);
    }

    if (opts.hasOwnProperty('version') && typeof opts.version == 'number') {
      _Logger.Logger.log("setting version: " + opts.version);

      add.setVersion(Number.parseInt(opts.version));
    }

    if (opts.hasOwnProperty('norm') && typeof opts.norm == 'string') {
      _Logger.Logger.log("setting normalisation: " + opts.norm);

      add.decoder.matrices.forEach(dec => dec.setNormalization(opts.norm));
    }

    if (opts.renormalize && typeof opts.renormalize == 'string') {
      _Logger.Logger.log("renormalizing matrices to " + opts.renormalize);

      if (opts.renormalize.toLowerCase() == 'sn3d' || opts.renormalize.toLowerCase() == 'n3d') {
        add.decoder.matrices.forEach(mat => mat.renormalizeTo(opts.renormalize));
      }
    }
  },

  _do_parse_json(file, carry, opts) {
    this._do_parse_native(file, carry, opts, JSON.parse(file.data), _ADCFormat.ContainerType.JSON);
  },

  _do_parse_xml(file, carry, opts) {
    this._do_parse_native(file, carry, opts, (0, _fastXmlParser.parse)(file.data, {
      ignoreAttributes: false
    }), _ADCFormat.ContainerType.XML);
  },

  _do_parse_add(file, carry, opts) {
    _Logger.Logger.log("Loading .add file '" + file.filename + "'");

    _ADDFormat.default.parse(JSON.parse(file.data), file.filename, carry, opts);
  },

  _do_parse_csv(file, carry, opts) {
    _Logger.Logger.log("Parsing CSV file '" + file.filename + "'");

    _CSVFormat.default.parse(Papa.parse(file.data), file.filename, carry, opts);
  },

  _do_parse_ambdec(file, carry, opts) {
    _Logger.Logger.log("Parsing ambdec file '" + file.filename + "'");

    _AmbdecFormat.default.parse(file, file.filename, carry, opts);
  },

  _do_parse_ambix_config(file, carry, opts) {
    _Logger.Logger.log("Parsing AmbiX configuration file '" + file.filename + "'");

    _AmbixConfigFormat.default.parse(file, file.filename, carry, opts);
  },

  _do_parse_native(file, carry, opts, obj, container_type) {
    let parsers_to_try = [];

    for (let format of formats) {
      if (format.container_type() === container_type && format.test(obj)) parsers_to_try.push(format);
    }

    _Logger.Logger.log("Parsing '" + file.filename + "' with '" + parsers_to_try.map(p => p.getName() + "' parser"));

    parsers_to_try.forEach(parser => parser.parse(obj, file.filename, carry, opts));
  }

};
exports.Converter = Converter;
//# sourceMappingURL=Converter.js.map