import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ConversionProcessData, ConverterOptions, ConverterOption, ConverterFile } from './ConverterHelpers';
import { ADD } from 'dotadd.js';

@_static_implements<ADCFormat>()
export default class ADDFormat {

    static shortName(): string {
        return "add";
    }

    static getName(): string {
        return "Ambisonic Decoder Description"
    }

    static getDescription(): string {
        return "Universal file format to describe Ambisonic decoders";
    }

    static container_type(): ContainerType {
        return ContainerType.JSON;
    }

    static test(obj: any): boolean {
        return obj.hasOwnProperty("name")
            && obj.hasOwnProperty("decoder")
            && obj.hasOwnProperty("revision");
    }

    static test2(f: ConverterFile): boolean {
        return false;
    }

    static parse(obj: object, filename: string, carry: ConversionProcessData, opts: ConverterOptions) {

        let add = new ADD(obj);

        if (add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);

    }

    static fromADD(add: ADD, opts: ConverterOptions): string {

        let prettify = opts.use('prettify');

        if (prettify)
            return JSON.stringify(add.export(), null, 4);
        else
            return add.export().serialize();
    }

}