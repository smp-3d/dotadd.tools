var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ContainerType, _static_implements } from "./ADCFormat";
import { ParserMessage, ParserMessageLevels } from './Converter';
import { ADD, Matrix, OutputChannel, AEDCoord } from 'dotadd.js';
let AmbidecodeSettings = class AmbidecodeSettings {
    static getName() {
        return "Ambidecode XML Settings Files";
    }
    static getDescription() {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
    }
    static container_type() {
        return ContainerType.XML;
    }
    static test(obj) {
        return obj.hasOwnProperty("ambidecode-settings");
    }
    static parse(obj, filename, carry, opts) {
        let incomplete = true;
        let add = new ADD();
        let ambset = obj['ambidecode-settings'];
        let order = ambset.order;
        let mat_width = Math.pow(order + 1, 2);
        if (carry.incomplete_results.length) {
            add = carry.incomplete_results.shift();
            incomplete = false;
        }
        if (!(ambset.type == 'SN3D' || ambset.type == 'N3D'))
            throw new Error("Unexpected normalisation: " + ambset.type);
        if (!add.decoder.matrices.length)
            add.addMatrix(new Matrix(0, ambset.type, []));
        else {
            if (add.decoder.matrices[0].getNormalisation() && add.decoder.matrices[0].getNormalisation() != 'unknown') {
                if (add.decoder.matrices[0].getNormalisation() != ambset.type.toLowerCase())
                    carry.messages.push(new ParserMessage(`Normalisation mismatch, expected ${add.decoder.matrices[0].getNormalisation()} but found ${ambset.type}`, ParserMessageLevels.err));
            }
            else {
                add.decoder.matrices[0].setNormalisation(ambset.type.toLowerCase());
            }
        }
        for (let i in ambset.speaker) {
            if (!(ambset.speaker[i].position['@_type'] === 'aed'))
                throw new Error('Unsupported coordinate type');
            let coords = ambset.speaker[i].position['#text'].split(' ');
            add.addOutput(new OutputChannel(`speaker_${i}`, 'spk', { coords: new AEDCoord(coords[0], coords[1], coords[2])
            }));
            let mix_arr = new Array(ambset.speaker.length).fill(0);
            mix_arr[Number.parseInt(i)] = ambset.speaker[i].gain;
            add.decoder.output.matrix.push(mix_arr);
        }
        console.log(JSON.stringify(add, null, 4));
        if (incomplete)
            carry.incomplete_results.push(add);
        else
            carry.results.push(add);
    }
};
AmbidecodeSettings = __decorate([
    _static_implements()
], AmbidecodeSettings);
export default AmbidecodeSettings;
