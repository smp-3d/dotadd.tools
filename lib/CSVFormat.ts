import { ADD, Matrix } from 'dotadd.js';
import { ParseResults, ConverterOptions } from './Converter'
import { ADCFormat, _static_implements, ContainerType } from './ADCFormat'
import * as Papa from 'papaparse'
import { ParseError } from './Util';

@_static_implements<ADCFormat>()
export default class CSVFormat {
    static shortName(): string {
        return "csv";
    }

    static getName(): string {
        return "CSV Files";
    }

    static getDescription(): string {
        return "Basic CSV Files";
    }

    static container_type(): ContainerType {
        return ContainerType.CSV;
    }

    static test(obj: any): boolean {
        return true;
    }

    static parse(obj: any, filename: string, carry: ParseResults, opts: ConverterOptions) {

        if(obj.errors.length)
            throw new ParseError(filename, "Could not parse CSV");

        let add = new ADD({
            name: "Ambisonic Decoder Description parsed from CSV File"
        });
        
        add.createDefaultMetadata();

        add.addMatrix(new Matrix(0, 'unknown', obj.data.map((arr: any[]) => arr.map((num: any) => Number.parseFloat(num)))));

        add.createDefaultOutputs();

        carry.incomplete_results.push(add);
    }

    static fromADD(add: ADD): string {

        let len = add.decoder.matrices[0].numCoeffs();

        let equal = add.decoder.matrices
            .reduce((eq: boolean, mat: Matrix) =>  mat.numCoeffs() == len, true);

        let output_arr = [];

        if(equal){
            for(let mat of add.decoder.matrices)
                output_arr.push(...mat.matrix);
        } else    
            output_arr = add.decoder.matrices[0].matrix;

        return Papa.unparse(output_arr);
    }

}