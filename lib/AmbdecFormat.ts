import { ADD, Matrix, AEDCoord, Filter, OutputChannel } from 'dotadd.js';
import { ParseResults, ConverterOptions, ConvertableTextFile } from './Converter'
import { ADCFormat, _static_implements, ContainerType } from './ADCFormat'
import { stringify } from 'querystring';
import { Parser } from 'papaparse';
import { ParseError } from './Util';

class Ambdec {
    normalisation =  "";
    xover =  0;
    xover_ratio =  0;

    hfmtx: number[][] = [];
    lfmtx: number[][] = [];

    mtx : number[][] = [];

    spks =  <{ coord: AEDCoord, name: string }[]> [];

    chmask = "";
}

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

    static parse(file: ConvertableTextFile, filename: string, carry: ParseResults, opts: ConverterOptions) {

        let add = new ADD();

        let lines = file.data.split('\n');

        let ambdec = new Ambdec();

        let parser_state = ParserState.COMMANDS;
        let current_matrix = '';

        lines.forEach((line: string, index: number) => {

            line = line.trim();

            line = line.split('#')[0];

            if(!line.length)
                return;

            if(line.charAt(0) == '/'){

                let cmd = parseAmbdecCommand(line);

                switch(cmd.name){

                    case '/description':
                        add.setName(cmd.value);
                        break;
                    case '/version':
                        add.setVersion(Number.parseInt(cmd.value));
                        break;
                    case '/dec/chan_mask':
                        ambdec.chmask = cmd.value;
                    case '/dec/coeff_scale':
                        ambdec.normalisation = cmd.value;
                        break;
                    case '/opt/xover_freq':
                        ambdec.xover = Number.parseFloat(cmd.value);
                        break;
                    case '/opt/xover_ratio':
                        ambdec.xover_ratio = Number.parseFloat(cmd.value);
                        break;
                    case '/speakers/{':
                        parser_state = ParserState.SPEAKERS;
                        break;
                    case '/lfmatrix/{':
                        parser_state = ParserState.MATRIX;
                        current_matrix = 'lf';
                        break;
                    case '/hfmatrix/{':
                        parser_state = ParserState.MATRIX;
                        current_matrix = 'hf';
                        break;
                    case '/matrix/{':
                        parser_state = ParserState.MATRIX;
                        current_matrix = 'r';
                        break;
                    case 'end_mat':
                        parser_state = ParserState.COMMANDS;
                        break;
                        
                }
            } else {

                switch(parser_state){
                    case ParserState.MATRIX:
                        doParseMatrix(line, current_matrix, ambdec);
                        break;
                    case ParserState.SPEAKERS:
                        doParseSpeaker(line, ambdec);
                        break;
                }
            }

        });

        if(ambdec.normalisation.toLowerCase() != 'sn3d' 
            && ambdec.normalisation.toLowerCase() != 'n3d')
            throw new ParseError(filename, "Unexpected normalisation: " + ambdec.normalisation);

        

        add.setDescription("Parsed from ambdec configuration file '" +  filename + "'");

        if(ambdec.hfmtx.length && ambdec.lfmtx.length){
            
            add.addFilter(Filter.makeLowpass(ambdec.xover));
            add.addFilter(Filter.makeHighpass(ambdec.xover));

            add.addMatrix(new Matrix(0, ambdec.normalisation, ambdec.lfmtx));
            add.addMatrix(new Matrix(1, ambdec.normalisation, ambdec.hfmtx));

        } else if(ambdec.mtx) {
            add.addMatrix(new Matrix(0, ambdec.normalisation, ambdec.mtx));
        }

        let acnmask = Number.parseInt("0x" + ambdec.chmask)
                        .toString(2).split('').map(s => Number.parseInt(s));

        add.decoder.matrices.forEach(mat => {

            mat.matrix.forEach((ch, i) => {

                let new_ch : number[] = [];

                acnmask.forEach(nfill => {
                    new_ch.push((nfill)? <number> ch.shift() : 0 );
                });

                mat.matrix[i] = new_ch;

            });
        });

        ambdec.spks.forEach(spk => {
            add.addOutput(new OutputChannel(spk.name, 'spk', { coords: spk.coord }));
        });

        for(let i = 0; i < add.numOutputs(); ++i){

            add.decoder.output.matrix.push(
                new Array(add.totalMatrixOutputs()).fill(0)
            )

            add.decoder.output.matrix[i][i] = 1;

            if(add.decoder.filter.length)
                add.decoder.output.matrix[i][i + add.numOutputs()] = 1;
        }

        add.createDefaultMetadata();
        
        if(add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }

    static fromADD(add: ADD): string {   
        return "";
    }

}

enum ParserState {
    COMMANDS,
    SPEAKERS,
    MATRIX
}

function parseAmbdecCommand(line: string): { name: string, value: any }{

    let elems = line.split(" ")
        .map(s => s.trim())
        .filter((s: string) => s.length);

    if(elems[0] == '/}')
        return { name: 'end_mat', value: null };

    if(elems.length == 1)
        return { name: elems[0], value: null };

    if(elems.length > 1)
        return { name: elems[0], value: elems[1] };

    return { name: "", value: "" };

}

function doParseMatrix(line: string, current_mtx: string, ambdec: Ambdec){
    
    let elems = line.trim().split(/\s+/).map(el => el.trim()).filter(el => el.length);

    if(elems[0] == 'add_row'){

        elems.shift();

        let coefs = elems.map(str => Number.parseFloat(str));

        switch(current_mtx){
            case 'lf':
                ambdec.lfmtx.push(coefs);
                break;
            case 'hf':
                ambdec.hfmtx.push(coefs);
                break;
            case 'r':
                ambdec.mtx.push(coefs);
                
        }
    }
}

function doParseSpeaker(line: string, ambdec: Ambdec){

    let elems = line.trim().split(/\s+/)
                .map((el: string) => el.trim())
                .filter((el: string) => el.length);

    if(elems.shift() == 'add_spkr'){

        let el_name = elems.shift();

        let crs = elems.map(str => Number.parseFloat(str));

        ambdec.spks.push({
            coord: new AEDCoord(crs[1], crs[2], crs[0]),
            name: <string> el_name
        });
    }
}