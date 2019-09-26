var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _static_implements, ContainerType } from './ADCFormat';
import { ParserMessage, ParserMessageLevels } from './Converter';
import { ADD, Matrix, OutputChannel, AEDCoord } from 'dotadd.js';
import { ParseError } from './Util';
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
        return ContainerType.JSON;
    }
    static test(obj) {
        return obj.hasOwnProperty('Name')
            && obj.hasOwnProperty("Description")
            && obj.hasOwnProperty("Decoder")
            && obj.Decoder.hasOwnProperty("Weights");
    }
    static parse(obj, filename, carry) {
        let add = new ADD({
            name: obj.Name,
            description: obj.Description,
            author: "IEM Graz",
        });
        if (!obj.LoudspeakerLayout)
            throw new ParseError(filename, "No Loudspeaker Layout found.");
        if (!obj.Decoder)
            throw new ParseError(filename, "No Decoder found in File");
        let date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();
        let ampm = date_str.slice(-2);
        let date = new Date(date_str.slice(0, -2));
        date.setHours(date.getHours() + ((ampm == 'pm') ? 12 : 0));
        try {
            add.setDate(date);
        }
        catch (e) {
            add.setDate(new Date(Date.now()).toISOString());
            carry.messages.push(new ParserMessage("Could not read Date value from description string", ParserMessageLevels.warn));
        }
        let mat = new Matrix(obj.Decoder.ExpectedInputNormalization, obj.Decoder.Matrix);
        if (obj.Decoder.WeightsAlreadyApplied && obj.Decoder.Weights != "none")
            mat.setWeighting(obj.Decoder.Weights);
        add.addMatrix(mat);
        let num_outputs = obj.LoudspeakerLayout.Loudspeakers
            .reduce((val, spk) => val + +!spk.IsImaginary, 0);
        let num_imags = obj.LoudspeakerLayout.Loudspeakers
            .reduce((val, spk) => val + spk.IsImaginary, 0);
        add.decoder.output.summing_matrix = [];
        for (let i = 0; i < obj.LoudspeakerLayout.Loudspeakers.length; ++i)
            add.decoder.output.summing_matrix.push(new Array(num_outputs).fill(0));
        obj.LoudspeakerLayout.Loudspeakers.forEach((speaker, index) => add.addOutput(new OutputChannel(`${(obj.LoudspeakerLayout.Name.length) ?
            obj.LoudspeakerLayout.Name : "spk"} ${index}${(speaker.IsImaginary) ? " [IMAG]" : ""}`, 'spk', new AEDCoord(speaker.Azimuth, speaker.Elevation, speaker.Radius))));
        obj.Decoder.Routing.forEach((ch, index) => {
            add.decoder.output.summing_matrix[ch - 1][index]
                = obj.LoudspeakerLayout.Loudspeakers[ch - 1].Gain;
        });
        if (add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }
    static fromADD(add, opts) {
        let iem = {
            Name: add.name,
            Description: add.description,
            Decoder: {
                Name: add.name,
                Description: add.description,
                ExpectedInputNormalization: add.decoder.matrices[0].getNormalization(),
                Weights: (add.decoder.matrices[0].weights) ? add.decoder.matrices[0].weights : "none",
                WeightsAlreadyApplied: (add.decoder.matrices[0].weights) ? true : false,
                Matrix: [],
                Routing: []
            },
            LoudspeakerLayout: {
                Name: add.name + '_layout',
                Loudspeakers: []
            }
        };
        add.decoder.output.channels.forEach((ch, i) => {
            let spk = {
                Azimuth: (ch.coords) ? ch.coords.a || 0 : 0,
                Elevation: (ch.coords) ? ch.coords.e || 0 : 0,
                Radius: (ch.coords) ? ch.coords.d || 1 : 0,
                IsImaginary: isImag(add, i),
                Channel: i + 1,
                Gain: gainForChannel(add, i)
            };
            if (!isImag(add, i))
                iem.Decoder.Routing.push(i + 1);
            iem.LoudspeakerLayout.Loudspeakers.push(spk);
        });
        removeNullSpeakers(add);
        iem.Decoder.Matrix = add.decoder.matrices[0].matrix;
        let prettify = opts.use('prettify');
        if (prettify)
            return JSON.stringify(iem, null, 4);
        else
            return JSON.stringify(iem);
    }
};
IEMFormat = __decorate([
    _static_implements()
], IEMFormat);
export default IEMFormat;
function removeNullSpeakers(add) {
    let new_chs = [];
    add.decoder.matrices[0].matrix.forEach((ch, i) => {
        if (chIsImag(add, i))
            new_chs.push(ch);
    });
    add.decoder.matrices[0].matrix = new_chs;
}
function summing_matrixWidth(add) {
    return add.decoder.output.summing_matrix[0].length;
}
function isImag(add, index) {
    return add.decoder.output.summing_matrix[index]
        .reduce((is_null, val) => is_null && (val == 0), true);
}
function chIsImag(add, index) {
    return !add.decoder.matrices[0].matrix[index].reduce((is_null, val) => is_null && (val == 0), true);
}
function gainForChannel(add, index) {
    return add.decoder.output.summing_matrix[index]
        .reduce((val, arr) => val + arr, 0);
}
