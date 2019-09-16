import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ParseResults, ConverterOptions, ConverterOption } from './Converter';
import { ADD, Matrix } from 'dotadd.js';

@_static_implements<ADCFormat>()
export default class AmbidecodeFormat {

    static getName(): string {
        return "Ambidecode XML Configuration Files"
    }  
      
    static getDescription(): string {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP. Consists of a settings and a coefficents file";
    }

    static container_type() : ContainerType {
        return ContainerType.XML;
    }

    static test(obj: Object): Boolean {
        return obj.hasOwnProperty("ambidecode-coefs") 
                || obj.hasOwnProperty("ambidecode-settings");
    }
   
    static parse(obj: Object, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let add = new ADD();

        let fnorm_opt = opts.use('norm');

    }

}