import { ContainerType, ADCFormat, _static_implements } from "./ADCFormat";
import { ParseResults, ConverterOptions, ConverterOption, ParserMessage, ParserMessageLevels } from './Converter';
import { ADD, Matrix, OutputChannel, AEDCoord, ACN } from 'dotadd.js';

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
   
    static parse(obj: any, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let incomplete: boolean = true;

        let add = new ADD(); 

        let ambset = obj['ambidecode-settings'];

        let order = ambset.order;

        let mat_width = Math.pow(order + 1, 2);

        if(carry.incomplete_results.length){
            add = <ADD> carry.incomplete_results.shift();
            incomplete = false;
        }

        if(!(ambset.type == 'SN3D' || ambset.type == 'N3D'))
            throw new Error("Unexpected normalisation: " + ambset.type);

        if(!add.decoder.matrices.length)
            add.addMatrix(new Matrix(0, ambset.type, []));
        else {

            if(add.decoder.matrices[0].getNormalisation() && add.decoder.matrices[0].getNormalisation() != 'unknown'){

                if(add.decoder.matrices[0].getNormalisation() != ambset.type.toLowerCase())
                    carry.messages.push(new ParserMessage(`Normalisation mismatch, expected ${
                                add.decoder.matrices[0].getNormalisation()} but found ${
                                ambset.type}`, ParserMessageLevels.err));
            } else {
                add.decoder.matrices[0].setNormalisation(ambset.type.toLowerCase());
            }

        }

        for(let i in ambset.speaker){

            if(!(ambset.speaker[i].position['@_type'] === 'aed'))
                throw new Error('Unsupported coordinate type');

            let coords = ambset.speaker[i].position['#text'].split(' ');

            add.addOutput(
                new OutputChannel(`speaker_${i}`, 'spk', 
                    { coords: new AEDCoord(
                                            coords[0], 
                                            coords[1], 
                                            coords[2])
                    }));

            let mix_arr = new Array(ambset.speaker.length).fill(0);

            mix_arr[Number.parseInt(i)] = ambset.speaker[i].gain;
            
            add.decoder.output.matrix.push(mix_arr);
        }

        if(add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);

    }

}