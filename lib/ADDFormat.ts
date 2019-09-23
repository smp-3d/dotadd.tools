import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ParseResults, ConverterOptions, ConverterOption } from './Converter';
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

    static container_type() : ContainerType {
        return ContainerType.JSON;
    }

    static test(obj: any): Boolean {
        return obj.hasOwnProperty("name")
                && obj.hasOwnProperty("decoder")
                && obj.hasOwnProperty("revision");
    }
   
    static parse(obj: object, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let add = new ADD(obj);

        if(add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);

    }

    static fromADD(add: ADD): string {
        return add.export().serialize();
    }

}