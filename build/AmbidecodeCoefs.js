var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ContainerType, _static_implements } from "./ADCFormat";
import { ADD, Matrix } from 'dotadd.js';
import { ParseError } from './Util';
let AmbidecodeCoefs = class AmbidecodeCoefs {
    static shortName() {
        return "ambidecode";
    }
    static getName() {
        return "Ambidecode XML Configuration Files";
    }
    static getDescription() {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
    }
    static container_type() {
        return ContainerType.XML;
    }
    static test(obj) {
        return obj.hasOwnProperty("ambidecode-coefs");
    }
    static parse(obj, filename, carry, opts) {
        let add = new ADD();
        let ambc = obj['ambidecode-coefs'];
        if (carry.incomplete_results.length) {
            add = carry.incomplete_results.pop();
            console.log('using incomplete result from previous run');
        }
        else
            add.setName(filename);
        if (!ambc.speaker[0].coef[0].hasOwnProperty("@_ACN"))
            throw new ParseError(filename, "Unsupported channel ordering");
        if (!add.decoder.matrices.length)
            add.addMatrix(new Matrix('unknown', []));
        else
            add.decoder.matrices[0].matrix = [];
        add.decoder.matrices[0].matrix = ambc.speaker.map((spk) => spk.coef.map((cf) => cf['#text']));
        add.createDefaultMetadata();
        add.refitOutputChannels();
        add.refitOutputMatrix();
        if (add.valid())
            carry.results.push(add);
        else {
            console.log('stashing incomplete result: ' + filename);
            carry.incomplete_results.push(add);
        }
    }
    static fromADD(add) {
        return "";
    }
};
AmbidecodeCoefs = __decorate([
    _static_implements()
], AmbidecodeCoefs);
export default AmbidecodeCoefs;
