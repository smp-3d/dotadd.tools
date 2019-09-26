import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ParseResults, ConverterOptions, ConverterOption } from './Converter';
import { ADD, Matrix } from 'dotadd.js';
import { ParseError } from './Util';
import { j2xParser } from 'fast-xml-parser';

@_static_implements<ADCFormat>()
export default class AmbidecodeCoefs {

    static shortName(): string{
        return "ambidecode";
    }

    static getName(): string {
        return "Ambidecode XML Configuration Files"
    }  
      
    static getDescription(): string {
        return "Exported and Imported by the ICST Ambisonics Externals for Max/MSP.";
    }

    static container_type() : ContainerType {
        return ContainerType.XML;
    }

    static test(obj: Object): Boolean {
        return obj.hasOwnProperty("ambidecode-coefs");
    }
   
    static parse(obj: any, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let add = new ADD();

        let ambc = obj['ambidecode-coefs'];

        if(carry.incomplete_results.length){
            add = <ADD> carry.incomplete_results.pop();
            console.log('using incomplete result from previous run')
        }
        else add.setName(filename);

        if(!ambc.speaker[0].coef[0].hasOwnProperty("@_ACN"))
            throw new ParseError(filename, "Unsupported channel ordering");

        if(!add.decoder.matrices.length)
            add.addMatrix(new Matrix('unknown', []));
        else
            add.decoder.matrices[0].matrix = [];

        
        add.decoder.matrices[0].matrix = ambc.speaker.map((spk: any) => spk.coef.map((cf: any) => cf['#text']));

        add.createDefaultMetadata();
        add.refitOutputChannels();
        add.refitOutputMatrix();

        if(add.valid())
            carry.results.push(add);
        else {
            console.log('stashing incomplete result: ' + filename);
            carry.incomplete_results.push(add);
        }
    }

    static fromADD(add: ADD): string {

        const parser = new j2xParser({ ignoreAttributes: false, format: true, indentBy: "    " });

        let base_obj = {
            'ambidecode-coefs': {
                '@_version': '0.1',
                speaker: <any[]> []
            }
        }

        add.decoder.matrices[add.decoder.matrices.length - 1].matrix.forEach((ch, chi) => {

            base_obj["ambidecode-coefs"].speaker.push({
                '@_index': chi,
                coef: ch.map((coeff, acn) => { return {'#text': coeff.toFixed(20), '@_ACN': ''+ acn };})
            });

        });

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + parser.parse(base_obj);

    }
}