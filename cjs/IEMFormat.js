"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ADCFormat = require("./ADCFormat");

var _dotadd = require("dotadd.js");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let IEMFormat = class IEMFormat {
  static shortName() {
    return "iem";
  }

  static getName() {
    return "IEM AllRad Decoder Configuration Files";
  }

  static getDescription() {
    return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
  }

  static container_type() {
    return _ADCFormat.ContainerType.JSON;
  }

  static test(obj) {
    return obj.hasOwnProperty('Name') && obj.hasOwnProperty("Description") && obj.hasOwnProperty("Decoder") && obj.Decoder.hasOwnProperty("Weights");
  }

  static parse(obj, filename, carry) {
    let add = new _dotadd.ADD({
      name: obj.Name,
      description: obj.Description,
      author: "IEM Graz"
    });
    let date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();
    let ampm = date_str.slice(-2);
    let date = new Date(date_str.slice(0, -2));
    date.setHours(date.getHours() + (ampm == 'pm' ? 12 : 0));
    add.setDate(date);
    add.addMatrix(new _dotadd.Matrix(0, obj.Decoder.ExpectedInputNormalization, obj.Decoder.Matrix));
    let num_outputs = obj.LoudspeakerLayout.Loudspeakers.reduce((val, spk) => val + +!spk.IsImaginary, 0);
    let num_imags = obj.LoudspeakerLayout.Loudspeakers.reduce((val, spk) => val + spk.IsImaginary, 0);
    add.decoder.output.matrix = [];

    for (let i = 0; i < obj.LoudspeakerLayout.Loudspeakers.length; ++i) add.decoder.output.matrix.push(new Array(num_outputs).fill(0));

    obj.LoudspeakerLayout.Loudspeakers.forEach((speaker, index) => add.addOutput(new _dotadd.OutputChannel(`${obj.LoudspeakerLayout.Name} ${index}${speaker.IsImaginary ? " [IMAG]" : ""}`, 'spk', {
      coords: new _dotadd.AEDCoord(speaker.Azimuth, speaker.Elevation, speaker.Radius)
    })));
    obj.Decoder.Routing.forEach((ch, index) => {
      add.decoder.output.matrix[ch - 1][index] = obj.LoudspeakerLayout.Loudspeakers[ch - 1].Gain;
    });
    if (add.valid()) carry.results.push(add);else carry.incomplete_results.push(add);
  }

  static fromADD(add, opts) {
    let iem = {
      Name: add.name,
      Description: add.description,
      Decoder: {
        Name: add.name,
        Description: add.description,
        ExpectedInputNormalization: add.decoder.matrices[0].getNormalisation(),
        Weights: "maxrE",
        WeightsAlreadyApplied: false,
        Matrix: [],
        Routing: []
      },
      LoudspeakerLayout: {
        Name: "",
        Loudspeakers: []
      }
    };
    add.decoder.output.channels.forEach((ch, i) => {
      let spk = {
        Azimuth: ch.coords.a || 0,
        Elevation: ch.coords.e || 0,
        Radius: ch.coords.d || 1,
        IsImaginary: isImag(add, i),
        Channel: i + 1,
        Gain: gainForChannel(add, i)
      };
      if (!isImag(add, i)) iem.Decoder.Routing.push(i + 1);
      iem.LoudspeakerLayout.Loudspeakers.push(spk);
    });
    iem.Decoder.Matrix = add.decoder.matrices[0].matrix;
    let prettify = opts.use('prettify');
    if (prettify) return JSON.stringify(iem, null, 4);else return JSON.stringify(iem);
  }

};
IEMFormat = __decorate([(0, _ADCFormat._static_implements)()], IEMFormat);
var _default = IEMFormat;
exports.default = _default;

function isImag(add, index) {
  return add.decoder.output.matrix[index].reduce((val, arr) => val + arr, 0) == 0.;
}

function gainForChannel(add, index) {
  return add.decoder.output.matrix[index].reduce((val, arr) => val + arr, 0);
}
//# sourceMappingURL=IEMFormat.js.map