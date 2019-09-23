import { _static_implements, ADCFormat, ContainerType } from './ADCFormat'
import { ParseResults } from './Converter'
import { ADD, Matrix } from 'dotadd.js'


@_static_implements<ADCFormat>()
export default class IEMFormat {

    static shortName(): string {
        return "iem";
    }

    static getName(): string {
        return "IEM AllRad Decoder Configuration Files"
    }  
      
    static getDescription(): string {
        return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
    }

    static container_type(): ContainerType {
        return ContainerType.JSON;
    }

    static test(obj: any): Boolean {
        return obj.hasOwnProperty('Name') 
                && obj.hasOwnProperty("Description") 
                && obj.hasOwnProperty("Decoder")
                && obj.Decoder.hasOwnProperty("Weights");
    }
   
    static parse(obj: any, filename: string, carry: ParseResults) {

        let add = new ADD({
            name: obj.Name,
            description: obj.Description,
            author: "IEM Graz",
        });

        let date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();

        let ampm = date_str.slice(-2);

        let date = new Date(date_str.slice(0, -2));

        date.setHours(date.getHours() + ((ampm == 'pm')? 12 : 0));

        add.setDate(date);

        let norm = obj.Decoder.ExpectedInputNormalization;

        add.addMatrix(new Matrix(0, norm, obj.Decoder.Matrix));

        add.repair();

        if(add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }

    static fromADD(add: ADD): string{
        return "";
    }

}