"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dotadd = require("dotadd.js");

var _ADCFormat = require("./ADCFormat");

var _Util = require("./Util");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

class Ambdec {
  constructor() {
    this.normalisation = "";
    this.xover = 0;
    this.xover_ratio = 0;
    this.hfmtx = [];
    this.lfmtx = [];
    this.mtx = [];
    this.spks = [];
    this.chmask = "";
  }

}

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

  static parse(file, filename, carry, opts) {
    let add = new _dotadd.ADD();
    let lines = file.data.split('\n');
    let ambdec = new Ambdec();
    let parser_state = ParserState.COMMANDS;
    let current_matrix = '';
    lines.forEach((line, index) => {
      line = line.trim();
      line = line.split('#')[0];
      if (!line.length) return;

      if (line.charAt(0) == '/') {
        let cmd = parseAmbdecCommand(line);

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

    let acnmask = Number.parseInt("0x" + ambdec.chmask).toString(2).split('').map(s => Number.parseInt(s));
    add.decoder.matrices.forEach(mat => {
      mat.matrix.forEach((ch, i) => {
        let new_ch = [];
        acnmask.forEach(nfill => {
          new_ch.push(nfill ? ch.shift() : 0);
        });
        mat.matrix[i] = new_ch;
      });
    });
    ambdec.spks.forEach(spk => {
      add.addOutput(new _dotadd.OutputChannel(spk.name, 'spk', {
        coords: spk.coord
      }));
    });

    for (let i = 0; i < add.numOutputs(); ++i) {
      add.decoder.output.matrix.push(new Array(add.totalMatrixOutputs()).fill(0));
      add.decoder.output.matrix[i][i] = 1;
      if (add.decoder.filter.length) add.decoder.output.matrix[i][i + add.numOutputs()] = 1;
    }

    add.createDefaultMetadata();
    if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
  }

  static fromADD(add) {
    return "";
  }

};
AmbdecFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbdecFormat);
var _default = AmbdecFormat;
exports.default = _default;
var ParserState;

(function (ParserState) {
  ParserState[ParserState["COMMANDS"] = 0] = "COMMANDS";
  ParserState[ParserState["SPEAKERS"] = 1] = "SPEAKERS";
  ParserState[ParserState["MATRIX"] = 2] = "MATRIX";
})(ParserState || (ParserState = {}));

function parseAmbdecCommand(line) {
  let elems = line.split(" ").map(s => s.trim()).filter(s => s.length);
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
  let elems = line.trim().split(/\s+/).map(el => el.trim()).filter(el => el.length);

  if (elems[0] == 'add_row') {
    elems.shift();
    let coefs = elems.map(str => Number.parseFloat(str));

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
  let elems = line.trim().split(/\s+/).map(el => el.trim()).filter(el => el.length);

  if (elems.shift() == 'add_spkr') {
    let el_name = elems.shift();
    let crs = elems.map(str => Number.parseFloat(str));
    ambdec.spks.push({
      coord: new _dotadd.AEDCoord(crs[1], crs[2], crs[0]),
      name: el_name
    });
  }
}
//# sourceMappingURL=AmbdecFormat.js.map