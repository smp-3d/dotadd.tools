var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ADD, Matrix } from 'dotadd.js';
import { _static_implements, ContainerType } from './ADCFormat';
import * as Papa from 'papaparse';
import { ParseError } from './Util';
let CSVFormat = class CSVFormat {
    static shortName() {
        return "csv";
    }
    static getName() {
        return "CSV Files";
    }
    static getDescription() {
        return "Basic CSV Files";
    }
    static container_type() {
        return ContainerType.CSV;
    }
    static test(obj) {
        return true;
    }
    static parse(obj, filename, carry, opts) {
        if (obj.errors.length)
            throw new ParseError(filename, "Could not parse CSV");
        let add = new ADD({
            name: "Ambisonic Decoder Description parsed from CSV File"
        });
        add.createDefaultMetadata();
        add.addMatrix(new Matrix('unknown', obj.data.map((arr) => arr.map((num) => Number.parseFloat(num)))));
        add.createDefaultOutputs();
        carry.incomplete_results.push(add);
    }
    static fromADD(add) {
        let len = add.decoder.matrices[0].numCoeffs();
        let equal = add.decoder.matrices
            .reduce((eq, mat) => mat.numCoeffs() == len, true);
        let output_arr = [];
        if (equal) {
            for (let mat of add.decoder.matrices)
                output_arr.push(...mat.matrix);
        }
        else
            output_arr = add.decoder.matrices[0].matrix;
        return Papa.unparse(output_arr);
    }
};
CSVFormat = __decorate([
    _static_implements()
], CSVFormat);
export default CSVFormat;
