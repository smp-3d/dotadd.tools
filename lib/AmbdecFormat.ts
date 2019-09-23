import { ADD, Matrix } from 'dotadd.js';
import { ParseResults, ConverterOptions } from './Converter'
import { ADCFormat, _static_implements, ContainerType } from './ADCFormat'

@_static_implements<ADCFormat>()
export default class AmbdecFormat {

    static shortName(): string {
        return "ambdec";
    }

    static getName(): string {
        return "Ambdec Files";
    }

    static getDescription(): string {
        return "Ambdec Files";
    }

    static container_type(): ContainerType {
        return ContainerType.CSV;
    }

    static test(obj: any): boolean {
        return true;
    }

    static parse(obj: Object, filename: string, carry: ParseResults, opts: ConverterOptions) {
        
    }

    static fromADD(add: ADD): string {   
        return "";
    }

}