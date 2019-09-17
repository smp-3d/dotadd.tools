import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ParseResults, ConverterOptions, ConverterOption } from './Converter';
import { ADD } from 'dotadd.js';

@_static_implements<ADCFormat>()
export default class ADDFormat {

    static getName(): string {
        return "Ambisonic Decoder Description"
    }  
      
    static getDescription(): string {
        return "Universal file format to describe Ambisonic decoders";
    }

    static container_type() : ContainerType {
        return ContainerType.JSON;
    }

    static test(obj: any): Boolean {
        return obj.hasOwnProperty("name") 
                && obj.hasOwnProperty("revision")
                && obj.hasOwnProperty("decoder")
                    && obj.decoder.hasOwnProperty("filter")
                    && obj.decoder.hasOwnProperty("matrices")
                    && obj.decoder.hasOwnProperty("output");
    }
   
    static parse(obj: object, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let add = new ADD(obj);

        carry.results.push(add);

    }

}