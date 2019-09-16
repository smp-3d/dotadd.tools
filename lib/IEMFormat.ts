import { _static_implements, ADCFormat, ContainerType } from './ADCFormat'
import { ParseResults } from './Converter'


@_static_implements<ADCFormat>()
export default class IEMFormat {

    static getName(): string {
        return "Ambidecode XML Configuration Files"
    }  
      
    static getDescription(): string {
        return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
    }

    static container_type(): ContainerType {
        return ContainerType.JSON;
    }

    static test(obj: Object): Boolean {
        return false;
    }
   
    static parse(obj: Object, filename: string, carry: ParseResults) {
        throw new Error("Method not implemented.");
    }

}