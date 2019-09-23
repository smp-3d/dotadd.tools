var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ContainerType, _static_implements } from "./ADCFormat";
import { ADD, Matrix, OutputChannel, AEDCoord } from 'dotadd.js';
import { ParseError } from './Util';
let AmbidecodeSettings = class AmbidecodeSettings {
    static shortName() {
        return "ambidecode_settings";
    }
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
        let add = new ADD();
        let ambset = obj['ambidecode-settings'];
        if (carry.incomplete_results.length) {
            add = carry.incomplete_results.pop();
            console.log('using incomplete result from previous run');
        }
        else
            add.setName(filename);
        if (!(ambset.type == 'SN3D' || ambset.type == 'N3D'))
            throw new ParseError(filename, "Unexpected normalisation: " + ambset.type);
        if (add.decoder.matrices.length) {
            add.decoder.matrices[0].setNormalisation(ambset.type);
        }
        else {
            add.addMatrix(new Matrix(0, ambset.type, []));
        }
        add.decoder.output.channels = ambset.speaker.map((spk, i) => {
            let coords = spk.position['#text'].split(' ');
            return new OutputChannel(`ambidecode_out_${i}`, 'spk', {
                coords: new AEDCoord(coords[0], coords[1], coords[2])
            });
        });
        add.refitOutputMatrix();
        add.createDefaultMetadata();
        if (add.valid()) {
            carry.results.push(add);
        }
        else {
            console.log('stashing incomplete result ' + filename);
            carry.incomplete_results.push(add);
        }
    }
    static fromADD(add) {
        return "";
    }
};
AmbidecodeSettings = __decorate([
    _static_implements()
], AmbidecodeSettings);
export default AmbidecodeSettings;
