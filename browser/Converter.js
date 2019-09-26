(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./ADCFormat", "./Logger", "fast-xml-parser", "papaparse", "./AmbidecodeCoefs", "./AmbidecodeSettings", "./IEMFormat", "./ADDFormat", "./CSVFormat", "./AmbdecFormat", "./AmbixConfigFormat"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./ADCFormat"), require("./Logger"), require("fast-xml-parser"), require("papaparse"), require("./AmbidecodeCoefs"), require("./AmbidecodeSettings"), require("./IEMFormat"), require("./ADDFormat"), require("./CSVFormat"), require("./AmbdecFormat"), require("./AmbixConfigFormat"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ADCFormat, global.Logger, global.fastXmlParser, global.papaparse, global.AmbidecodeCoefs, global.AmbidecodeSettings, global.IEMFormat, global.ADDFormat, global.CSVFormat, global.AmbdecFormat, global.AmbixConfigFormat);
    global.Converter = mod.exports;
  }
})(this, function (_exports, _ADCFormat, _Logger, _fastXmlParser, Papa, _AmbidecodeCoefs, _AmbidecodeSettings, _IEMFormat, _ADDFormat, _CSVFormat, _AmbdecFormat, _AmbixConfigFormat) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Converter = _exports.ConverterOptions = _exports.ConverterOption = _exports.ConvertableTextFile = _exports.ParseResults = _exports.ParserMessage = _exports.ParserMessageLevels = void 0;
  Papa = _interopRequireWildcard(Papa);
  _AmbidecodeCoefs = _interopRequireDefault(_AmbidecodeCoefs);
  _AmbidecodeSettings = _interopRequireDefault(_AmbidecodeSettings);
  _IEMFormat = _interopRequireDefault(_IEMFormat);
  _ADDFormat = _interopRequireDefault(_ADDFormat);
  _CSVFormat = _interopRequireDefault(_CSVFormat);
  _AmbdecFormat = _interopRequireDefault(_AmbdecFormat);
  _AmbixConfigFormat = _interopRequireDefault(_AmbixConfigFormat);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

  var formats = [_ADDFormat.default, _AmbidecodeCoefs.default, _AmbidecodeSettings.default, _IEMFormat.default, _CSVFormat.default, _AmbdecFormat.default, _AmbixConfigFormat.default];
  var ParserMessageLevels;
  _exports.ParserMessageLevels = ParserMessageLevels;

  (function (ParserMessageLevels) {
    ParserMessageLevels[ParserMessageLevels["note"] = 0] = "note";
    ParserMessageLevels[ParserMessageLevels["warn"] = 1] = "warn";
    ParserMessageLevels[ParserMessageLevels["err"] = 2] = "err";
  })(ParserMessageLevels || (_exports.ParserMessageLevels = ParserMessageLevels = {}));

  var ParserMessage = function ParserMessage(mess, level) {
    _classCallCheck(this, ParserMessage);

    this.message = mess;
    this.level = level;
  };

  _exports.ParserMessage = ParserMessage;

  var ParseResults = function ParseResults() {
    _classCallCheck(this, ParseResults);

    this.results = [];
    this.incomplete_results = [];
    this.messages = [];
    this.output_files = [];
  };

  _exports.ParseResults = ParseResults;

  var ConvertableTextFile = function ConvertableTextFile(fname, data) {
    _classCallCheck(this, ConvertableTextFile);

    this.filename = fname;
    this.data = data;
  };

  _exports.ConvertableTextFile = ConvertableTextFile;

  var ConverterOption =
  /*#__PURE__*/
  function () {
    function ConverterOption(name, value) {
      _classCallCheck(this, ConverterOption);

      this.used = false;
      this.name = name;
      this.value = value;
    }

    _createClass(ConverterOption, [{
      key: "type",
      value: function type() {
        return _typeof(this.value);
      }
    }, {
      key: "peek",
      value: function peek() {
        return this.value;
      }
    }, {
      key: "wasUsed",
      value: function wasUsed() {
        return this.used;
      }
    }, {
      key: "use",
      value: function use() {
        this.used = true;
        return this.value;
      }
    }]);

    return ConverterOption;
  }();

  _exports.ConverterOption = ConverterOption;

  var ConverterOptions =
  /*#__PURE__*/
  function () {
    function ConverterOptions() {
      _classCallCheck(this, ConverterOptions);

      this.options = [];

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.options = args;
    }

    _createClass(ConverterOptions, [{
      key: "has",
      value: function has(name) {
        return this.options.find(function (opt) {
          return opt.name === name;
        }) != undefined;
      }
    }, {
      key: "get",
      value: function get(name) {
        return this.options.find(function (opt) {
          return opt.name === name;
        });
      }
    }, {
      key: "use",
      value: function use(name) {
        var opt = this.get(name);
        if (opt) return opt.use();
      }
    }, {
      key: "getUnused",
      value: function getUnused() {
        return this.options.reduce(function (carry, current) {
          !current.used ? carry.push(current) : null;
          return carry;
        }, []);
      }
    }]);

    return ConverterOptions;
  }();

  _exports.ConverterOptions = ConverterOptions;
  var Converter = {
    convert_string: function convert_string(files, options) {
      var results = new ParseResults();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;
          var ftype = file.filename.slice((file.filename.lastIndexOf(".") - 1 >>> 0) + 2);

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
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      _Logger.Logger.log("Applying command line options");

      this._do_apply_options(results, options);

      this._do_convert(results, options);

      return results;
    },
    _do_convert: function _do_convert(carry, opts) {
      var ofopt = opts.use('format');
      var output = opts.use('output');
      var fileext = "",
          format;
      if (output) fileext = output.slice((output.lastIndexOf(".") - 1 >>> 0) + 2);
      if (ofopt) format = ofopt;else if (fileext.length) format = fileext;else format = 'add';
      var converter = formats.find(function (frm) {
        return frm.shortName() == format;
      });

      if (converter) {
        _Logger.Logger.log("Using '" + converter.getName() + "' exporter");

        carry.results.forEach(function (res) {
          var data = converter.fromADD(res, opts);

          _Logger.Logger.log("Producing output: '" + res.name + "', format: '" + format + "', container: " + containerTypeToString(converter.container_type()));

          carry.output_files.push({
            name: res.name,
            format: format,
            container: containerTypeToString(converter.container_type()),
            data: data,
            add: res
          });
        });
      } else throw new Error("Exporter '" + format + "' not found");
    },
    _do_apply_options: function _do_apply_options(carry, opts) {
      var _this = this,
          _carry$incomplete_res;

      var mopts = {
        description: opts.use('description'),
        name: opts.use('name'),
        author: opts.use('author'),
        version: opts.use('version'),
        norm: opts.use('norm'),
        renormalize: opts.use('reNorm')
      };
      carry.results.forEach(function (res) {
        return _this._do_apply_options_impl(res, mopts);
      });
      carry.incomplete_results.forEach(function (res) {
        return _this._do_apply_options_impl(res, mopts);
      });
      var restash = [];

      while (carry.incomplete_results.length) {
        var add = carry.incomplete_results.shift();

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

      (_carry$incomplete_res = carry.incomplete_results).push.apply(_carry$incomplete_res, restash);
    },
    _do_apply_options_impl: function _do_apply_options_impl(add, opts) {
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

        add.decoder.matrices.forEach(function (dec) {
          return dec.setNormalization(opts.norm);
        });
      }

      if (opts.renormalize && typeof opts.renormalize == 'string') {
        _Logger.Logger.log("renormalizing matrices to " + opts.renormalize);

        if (opts.renormalize.toLowerCase() == 'sn3d' || opts.renormalize.toLowerCase() == 'n3d') {
          add.decoder.matrices.forEach(function (mat) {
            return mat.renormalizeTo(opts.renormalize);
          });
        }
      }
    },
    _do_parse_json: function _do_parse_json(file, carry, opts) {
      this._do_parse_native(file, carry, opts, JSON.parse(file.data), _ADCFormat.ContainerType.JSON);
    },
    _do_parse_xml: function _do_parse_xml(file, carry, opts) {
      this._do_parse_native(file, carry, opts, (0, _fastXmlParser.parse)(file.data, {
        ignoreAttributes: false
      }), _ADCFormat.ContainerType.XML);
    },
    _do_parse_add: function _do_parse_add(file, carry, opts) {
      _Logger.Logger.log("Loading .add file '" + file.filename + "'");

      _ADDFormat.default.parse(JSON.parse(file.data), file.filename, carry, opts);
    },
    _do_parse_csv: function _do_parse_csv(file, carry, opts) {
      _Logger.Logger.log("Parsing CSV file '" + file.filename + "'");

      _CSVFormat.default.parse(Papa.parse(file.data), file.filename, carry, opts);
    },
    _do_parse_ambdec: function _do_parse_ambdec(file, carry, opts) {
      _Logger.Logger.log("Parsing ambdec file '" + file.filename + "'");

      _AmbdecFormat.default.parse(file, file.filename, carry, opts);
    },
    _do_parse_ambix_config: function _do_parse_ambix_config(file, carry, opts) {
      _Logger.Logger.log("Parsing AmbiX configuration file '" + file.filename + "'");

      _AmbixConfigFormat.default.parse(file, file.filename, carry, opts);
    },
    _do_parse_native: function _do_parse_native(file, carry, opts, obj, container_type) {
      var parsers_to_try = [];

      for (var _i = 0, _formats = formats; _i < _formats.length; _i++) {
        var format = _formats[_i];
        if (format.container_type() === container_type && format.test(obj)) parsers_to_try.push(format);
      }

      _Logger.Logger.log("Parsing '" + file.filename + "' with '" + parsers_to_try.map(function (p) {
        return p.getName() + "' parser";
      }));

      parsers_to_try.forEach(function (parser) {
        return parser.parse(obj, file.filename, carry, opts);
      });
    }
  };
  _exports.Converter = Converter;
});