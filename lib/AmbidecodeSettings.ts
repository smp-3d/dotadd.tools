import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ParseResults, ConverterOptions, ConverterOption } from './Converter';
import { ADD, Matrix } from 'dotadd.js';

@_static_implements<ADCFormat>()
export default class AmbidecodeSettings {

    static getName(): string {
        return "Ambidecode XML Settings Files"
    }  
      
    static getDescription(): string {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
    }

    static container_type() : ContainerType {
        return ContainerType.XML;
    }

    static test(obj: Object): Boolean {
        return obj.hasOwnProperty("ambidecode-settings");
    }
   
    static parse(obj: Object, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let add = new ADD();

    }

}