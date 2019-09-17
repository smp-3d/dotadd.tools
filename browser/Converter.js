(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./ADCFormat", "./AmbidecodeCoefs", "./AmbidecodeSettings", "./IEMFormat", "./ADDFormat", "fast-xml-parser"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./ADCFormat"), require("./AmbidecodeCoefs"), require("./AmbidecodeSettings"), require("./IEMFormat"), require("./ADDFormat"), require("fast-xml-parser"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ADCFormat, global.AmbidecodeCoefs, global.AmbidecodeSettings, global.IEMFormat, global.ADDFormat, global.fastXmlParser);
    global.Converter = mod.exports;
  }
})(this, function (_exports, _ADCFormat, _AmbidecodeCoefs, _AmbidecodeSettings, _IEMFormat, _ADDFormat, _fastXmlParser) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Converter = _exports.ConverterOptions = _exports.ConverterOption = _exports.ConvertableTextFile = _exports.ParseResults = _exports.ParserMessage = _exports.ParserMessageLevels = void 0;
  _AmbidecodeCoefs = _interopRequireDefault(_AmbidecodeCoefs);
  _AmbidecodeSettings = _interopRequireDefault(_AmbidecodeSettings);
  _IEMFormat = _interopRequireDefault(_IEMFormat);
  _ADDFormat = _interopRequireDefault(_ADDFormat);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var formats = [_ADDFormat.default, _AmbidecodeCoefs.default, _AmbidecodeSettings.default, _IEMFormat.default];
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

      return results;
    },
    convert_binary: function convert_binary(filename, data, options) {},
    list_formats: function list_formats() {},
    _do_parse_json: function _do_parse_json(file, carry, opts) {
      this._do_parse_native(file, carry, opts, JSON.parse(file.data), _ADCFormat.ContainerType.JSON);
    },
    _do_parse_xml: function _do_parse_xml(file, carry, opts) {
      this._do_parse_native(file, carry, opts, (0, _fastXmlParser.parse)(file.data, {
        ignoreAttributes: false
      }), _ADCFormat.ContainerType.XML);
    },
    _do_parse_add: function _do_parse_add(file, carry, opts) {
      _ADDFormat.default.parse(JSON.parse(file.data), file.filename, carry, opts);
    },
    _do_parse_native: function _do_parse_native(file, carry, opts, obj, container_type) {
      var parsers_to_try = [];
      var output_file = opts.use('output');
      if (output_file) console.log('output file: ' + output_file);
      console.log();
      console.log("Converting: " + file.filename);

      for (var _i = 0, _formats = formats; _i < _formats.length; _i++) {
        var format = _formats[_i];
        if (format.container_type() === container_type && format.test(obj)) parsers_to_try.push(format);
      }

      console.log('Matched the following parsers: ');
      parsers_to_try.forEach(function (p) {
        return console.log(p.name);
      });
      parsers_to_try.forEach(function (parser) {
        return parser.parse(obj, file.filename, carry, opts);
      });
    }
  };
  _exports.Converter = Converter;
});