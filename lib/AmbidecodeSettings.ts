import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";

import {
    ConversionProcessData, ConverterOptions,
    ConverterOption, ConverterMessage,
    ConverterMessageLevel,
    ConverterFile
} from './ConverterHelpers';

import { ADD, Matrix, OutputChannel, AEDCoord, ACN } from 'dotadd.js';

import { ParseError } from './Util';

@_static_implements<ADCFormat>()
export default class AmbidecodeSettings {

    static shortName(): string {
        return "ambidecode_settings";
    }

    static getName(): string {
        return "Ambidecode XML Settings Files"
    }

    static getDescription(): string {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
    }

    static container_type(): ContainerType {
        return ContainerType.XML;
    }

    static test(obj: Object): boolean {
        return obj.hasOwnProperty("ambidecode-settings");
    }

    static test2(f: ConverterFile): boolean {
        return false;
    }

    static parse(obj: any, filename: string, carry: ConversionProcessData, opts: ConverterOptions) {

        let add = new ADD();

        let ambset = obj['ambidecode-settings'];

        if (carry.incomplete_results.length) {
            add = <ADD>carry.incomplete_results.pop();
            console.log('using incomplete result from previous run')
        }
        else add.setName(filename);


        if (!(ambset.type == 'SN3D' || ambset.type == 'N3D'))
            throw new ParseError(filename, "Unexpected normalisation: " + ambset.type);

        if (add.decoder.matrices.length) {
            add.decoder.matrices[0].setNormalization(ambset.type);
        } else {
            add.addMatrix(new Matrix(ambset.type, []));
        }

        add.decoder.output.channels = ambset.speaker.map((spk: any, i: number) => {

            let coords = spk.position['#text'].split(' ').map((n: string) => Number.parseFloat(n));

            return new OutputChannel(`ambidecode_out_${i}`, 'spk', new AEDCoord(coords[0], coords[1], coords[2]));
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

    static fromADD(add: ADD): string {
        return "";
    }
}