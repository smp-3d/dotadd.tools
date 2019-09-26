"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ADCFormat = require("./ADCFormat");

var _dotadd = require("dotadd.js");

var _Util = require("./Util");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var ParserState;

(function (ParserState) {
  ParserState[ParserState["GLOBAL"] = 0] = "GLOBAL";
  ParserState[ParserState["HRTF_SECT"] = 1] = "HRTF_SECT";
  ParserState[ParserState["DEC_MAT"] = 2] = "DEC_MAT";
  ParserState[ParserState["DEFAULT"] = 3] = "DEFAULT";
})(ParserState || (ParserState = {}));

class AmbixConf {
  constructor() {
    this.debug_msg = "";
    this.coef_scale = "";
    this.coef_seq = "";
    this.cflip = 0;
    this.cflop = 0;
    this.cflap = 0;
    this.dec_mat_gain = 1.;
    this.invert_condon_shortley = false;
    this.coefs = [];
  }

}

let AmbixConfigFormat = class AmbixConfigFormat {
  static shortName() {
    return "config";
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
    let add = new _dotadd.ADD();
    let ambix = new AmbixConf();
    let lines = ambixRemoveComments(file.data.split('\n'));
    let pstate = ParserState.DEFAULT;
    lines.forEach(line => pstate = ambixReadLine(ambix, line, pstate));
    if (!(ambix.coef_scale.toLowerCase() === 'sn3d' || ambix.coef_scale.toLowerCase() === 'n3d')) throw new _Util.ParseError(filename + '.config', "Unexpected normalization: '" + ambix.coef_scale + "'");
    ambixDecApplyOptions(ambix);
    ambixDecFillZeroes(ambix);
    add.setName(ambix.debug_msg.length ? ambix.debug_msg : filename);
    add.setDescription("Parsed from ambix decoder configuration file / " + "filename" + ".config");
    add.addMatrix(new _dotadd.Matrix(ambix.coef_scale, ambix.coefs));
    add.setAuthor("Matthias Kronlachner feat. the dotaddtool creators");
    add.createDefaultMetadata();
    add.createDefaultOutputs();
    addMakeImags(add);
    if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
  }

  static fromADD(add, opts) {
    let out = {
      data: ""
    };
    ambixWriteLine(out, "// created with the dotaddtool - " + new Date(Date.now()).toISOString());
    ambixWriteNewlines(out, 2);
    ambixWriteBlockBegin(out, "GLOBAL");
    ambixWriteValue(out, "debug_msg", add.name);
    ambixWriteValue(out, "coeff_scale", add.decoder.matrices[add.decoder.matrices.length - 1].normalization);
    ambixWriteValue(out, "coeff_seq", "acn");
    ambixWriteValue(out, "dec_mat_gain", "1.000");
    ambixWriteBlockEnd(out);
    ambixWriteNewlines(out, 2);
    ambixWriteBlockBegin(out, "HRTF");
    ambixWriteBlockEnd(out);
    ambixWriteNewlines(out, 2);
    ambixWriteDec(out, add.decoder.matrices[add.decoder.matrices.length - 1].matrix);
    ambixWriteNewlines(out, 1);
    return out.data;
  }

};
AmbixConfigFormat = __decorate([(0, _ADCFormat._static_implements)()], AmbixConfigFormat);
var _default = AmbixConfigFormat;
exports.default = _default;
;

function ambixDecFillZeroes(ambix) {
  let max_s = ambix.coefs.reduce((len, row) => len > row.length ? len : row.length, 0);
  ambix.coefs.forEach(row => {
    while (!(row.length === max_s)) row.push(0);
  });
}

function ambixReadLine(ambix, line, state) {
  switch (state) {
    case ParserState.GLOBAL:
      return ambixReadGlobalValue(ambix, line);

    case ParserState.DEC_MAT:
      return ambixReadDecoderRow(ambix, line);

    case ParserState.HRTF_SECT:
      return ambixReadHrtfSection(ambix, line);

    default:
      return ambixReadDefault(ambix, line);
  }
}

function ambixReadDefault(ambix, line) {
  if (line.includes("#GLOBAL")) return ParserState.GLOBAL;
  if (line.includes("#HRTF")) return ParserState.HRTF_SECT;
  if (line.includes("#DECODERMATRIX")) return ParserState.DEC_MAT;
  return ParserState.DEFAULT;
}

function ambixReadHrtfSection(ambix, line) {
  if (line.includes("#END")) return ParserState.DEFAULT;
  return ParserState.HRTF_SECT;
}

function ambixReadDecoderRow(ambix, line) {
  if (line.includes("#END")) return ParserState.DEFAULT;
  let coefs = line.split(/\s+/).map(str => Number.parseFloat(str));
  ambix.coefs.push(coefs);
  return ParserState.DEC_MAT;
}

function ambixReadGlobalValue(ambix, line) {
  if (line.includes("#END")) return ParserState.DEFAULT;
  let vals = line.split(/\s+/);

  switch (vals.shift()) {
    case '/debug_msg':
      ambix.debug_msg = vals.join(" ");

    case '/coeff_scale':
      ambix.coef_scale = vals.shift();

    case '/coeff_seq':
      ambix.coef_seq = vals.shift();

    case '/flip':
      ambix.cflip = Number.parseInt(vals.shift());

    case '/flap':
      ambix.cflap = Number.parseInt(vals.shift());

    case '/flop':
      ambix.cflop = Number.parseInt(vals.shift());

    case '/dec_mat_gain':
      ambix.dec_mat_gain = Number.parseFloat(vals.shift());

    case '/invert_condon_shortley':
      ambix.invert_condon_shortley = Number.parseInt(vals.shift()) === 1;
  }

  return ParserState.GLOBAL;
}

function ambixRemoveComments(lines) {
  return lines.map(line => {
    return line.split("//")[0].trim();
  });
}

function addMakeImags(add) {
  add.decoder.matrices[0].matrix.forEach((row, i) => {
    if (row.reduce((is_nul, coef) => is_nul && coef == 0, true)) add.decoder.output.summing_matrix[i].fill(0);
  });
}

function ambixDecApplyOptions(ambix) {
  let flip = 1,
      flop = 1,
      flap = 1,
      total = 1;
  let flipp = ambix.cflip === 1;
  let flapp = ambix.cflap === 1;
  let flopp = ambix.cflop === 1;
  let cshortley = ambix.invert_condon_shortley;

  if (cshortley || flipp || flapp || flopp) {
    ambix.coefs.forEach(row => {
      row.forEach((coef, i) => {
        let m = _dotadd.ACN.index(i);

        let l = _dotadd.ACN.order(i); // this section is copied 1::1 from the kronlachner plugins code


        if (flipp && m < 0) // m < 0 -> invert
          flip = -1;
        if (flopp && (m < 0 && !(m % 2) || m >= 0 && m % 2)) // m < 0 and even || m >= 0 and odd ()
          flop = -1;
        if (flapp && (l + m) % 2) // l+m odd   ( (odd, even) or (even, odd) )
          flap = -1;
        if (cshortley) total = Math.pow(-1, i) * flip * flop * flap;else total = flip * flop * flap;
        row[i] = coef * total;
      });
    });
  }
}

function ambixWriteDec(out, coeffs) {
  ambixWriteBlockBegin(out, "DECODERMATRIX");
  coeffs.forEach(ch => {
    ambixWriteLine(out, ch.join("\t"));
  });
  ambixWriteBlockEnd(out);
}

function ambixWriteBlockBegin(out, name) {
  ambixWriteLine(out, `#${name}`);
}

function ambixWriteBlockEnd(out) {
  ambixWriteLine(out, "#END");
}

function ambixWriteValue(out, name, value) {
  ambixWriteLine(out, `/${name}\t ${value}`);
}

function ambixWriteLine(out, line) {
  out.data = out.data + line + "\n";
}

function ambixWriteNewlines(out, lines) {
  for (let i = 0; i < lines; ++i) out.data = out.data + "\n";
}
//# sourceMappingURL=AmbixConfigFormat.js.map