(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "dotadd.js", "./ADCFormat", "./Util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("dotadd.js"), require("./ADCFormat"), require("./Util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.dotadd, global.ADCFormat, global.Util);
    global.AmbdecFormat = mod.exports;
  }
})(this, function (_exports, _dotadd, _ADCFormat, _Util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
      if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  var Ambdec = function Ambdec() {
    _classCallCheck(this, Ambdec);

    this.normalisation = "";
    this.xover = 0;
    this.xover_ratio = 0;
    this.hfmtx = [];
    this.lfmtx = [];
    this.mtx = [];
    this.spks = [];
    this.chmask = "";
  };

  var AmbdecFormat =
  /*#__PURE__*/
  function () {
    function AmbdecFormat() {
      _classCallCheck(this, AmbdecFormat);
    }

    _createClass(AmbdecFormat, null, [{
      key: "shortName",
      value: function shortName() {
        return "ambdec";
      }
    }, {
      key: "getName",
      value: function getName() {
        return "Ambdec Files";
      }
    }, {
      key: "getDescription",
      value: function getDescription() {
        return "Ambdec Files";
      }
    }, {
      key: "container_type",
      value: function container_type() {
        return _ADCFormat.ContainerType.AMBDEC;
      }
    }, {
      key: "test",
      value: function test(obj) {
        return false;
      }
    }, {
      key: "parse",
      value: function parse(file, filename, carry, opts) {
        var add = new _dotadd.ADD();
        var lines = file.data.split('\n');
        var ambdec = new Ambdec();
        var parser_state = ParserState.COMMANDS;
        var current_matrix = '';
        lines.forEach(function (line, index) {
          line = line.trim();
          line = line.split('#')[0];
          if (!line.length) return;

          if (line.charAt(0) == '/') {
            var cmd = parseAmbdecCommand(line);

            switch (cmd.name) {
              case '/description':
                add.setName(cmd.value);
                break;

              case '/version':
                add.setVersion(Number.parseInt(cmd.value));
                break;

              case '/dec/chan_mask':
                ambdec.chmask = cmd.value;

              case '/dec/coeff_scale':
                ambdec.normalisation = cmd.value;
                break;

              case '/opt/xover_freq':
                ambdec.xover = Number.parseFloat(cmd.value);
                break;

              case '/opt/xover_ratio':
                ambdec.xover_ratio = Number.parseFloat(cmd.value);
                break;

              case '/speakers/{':
                parser_state = ParserState.SPEAKERS;
                break;

              case '/lfmatrix/{':
                parser_state = ParserState.MATRIX;
                current_matrix = 'lf';
                break;

              case '/hfmatrix/{':
                parser_state = ParserState.MATRIX;
                current_matrix = 'hf';
                break;

              case '/matrix/{':
                parser_state = ParserState.MATRIX;
                current_matrix = 'r';
                break;

              case 'end_mat':
                parser_state = ParserState.COMMANDS;
                break;
            }
          } else {
            switch (parser_state) {
              case ParserState.MATRIX:
                doParseMatrix(line, current_matrix, ambdec);
                break;

              case ParserState.SPEAKERS:
                doParseSpeaker(line, ambdec);
                break;
            }
          }
        });
        if (ambdec.normalisation.toLowerCase() != 'sn3d' && ambdec.normalisation.toLowerCase() != 'n3d') throw new _Util.ParseError(filename, "Unexpected normalisation: " + ambdec.normalisation);
        add.setDescription("Parsed from ambdec configuration file '" + filename + "'");

        if (ambdec.hfmtx.length && ambdec.lfmtx.length) {
          add.addFilter(_dotadd.Filter.makeLowpass(ambdec.xover));
          add.addFilter(_dotadd.Filter.makeHighpass(ambdec.xover));
          add.addMatrix(new _dotadd.Matrix(0, ambdec.normalisation, ambdec.lfmtx));
          add.addMatrix(new _dotadd.Matrix(1, ambdec.normalisation, ambdec.hfmtx));
        } else if (ambdec.mtx) {
          add.addMatrix(new _dotadd.Matrix(0, ambdec.normalisation, ambdec.mtx));
        }

        var acnmask = Number.parseInt("0x" + ambdec.chmask).toString(2).split('').map(function (s) {
          return Number.parseInt(s);
        });
        add.decoder.matrices.forEach(function (mat) {
          mat.matrix.forEach(function (ch, i) {
            var new_ch = [];
            acnmask.forEach(function (nfill) {
              new_ch.push(nfill ? ch.shift() : 0);
            });
            mat.matrix[i] = new_ch;
          });
        });
        ambdec.spks.forEach(function (spk) {
          add.addOutput(new _dotadd.OutputChannel(spk.name, 'spk', {
            coords: spk.coord
          }));
        });

        for (var i = 0; i < add.numOutputs(); ++i) {
          add.decoder.output.matrix.push(new Array(add.totalMatrixOutputs()).fill(0));
          add.decoder.output.matrix[i][i] = 1;
          if (add.decoder.filter.length) add.decoder.output.matrix[i][i + add.numOutputs()] = 1;
        }

        add.createDefaultMetadata();
        if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
      }
    }, {
      key: "fromADD",
      value: function fromADD(add) {
        return "";
      }
    }]);

    return AmbdecFormat;
  }();

  AmbdecFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbdecFormat);
  var _default = AmbdecFormat;
  _exports.default = _default;
  var ParserState;

  (function (ParserState) {
    ParserState[ParserState["COMMANDS"] = 0] = "COMMANDS";
    ParserState[ParserState["SPEAKERS"] = 1] = "SPEAKERS";
    ParserState[ParserState["MATRIX"] = 2] = "MATRIX";
  })(ParserState || (ParserState = {}));

  function parseAmbdecCommand(line) {
    var elems = line.split(" ").map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return s.length;
    });
    if (elems[0] == '/}') return {
      name: 'end_mat',
      value: null
    };
    if (elems.length == 1) return {
      name: elems[0],
      value: null
    };
    if (elems.length > 1) return {
      name: elems[0],
      value: elems[1]
    };
    return {
      name: "",
      value: ""
    };
  }

  function doParseMatrix(line, current_mtx, ambdec) {
    var elems = line.trim().split(/\s+/).map(function (el) {
      return el.trim();
    }).filter(function (el) {
      return el.length;
    });

    if (elems[0] == 'add_row') {
      elems.shift();
      var coefs = elems.map(function (str) {
        return Number.parseFloat(str);
      });

      switch (current_mtx) {
        case 'lf':
          ambdec.lfmtx.push(coefs);
          break;

        case 'hf':
          ambdec.hfmtx.push(coefs);
          break;

        case 'r':
          ambdec.mtx.push(coefs);
      }
    }
  }

  function doParseSpeaker(line, ambdec) {
    var elems = line.trim().split(/\s+/).map(function (el) {
      return el.trim();
    }).filter(function (el) {
      return el.length;
    });

    if (elems.shift() == 'add_spkr') {
      var el_name = elems.shift();
      var crs = elems.map(function (str) {
        return Number.parseFloat(str);
      });
      ambdec.spks.push({
        coord: new _dotadd.AEDCoord(crs[1], crs[2], crs[0]),
        name: el_name
      });
    }
  }
});