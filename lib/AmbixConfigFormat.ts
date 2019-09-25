import { ContainerType, _static_implements, ADCFormat } from "./ADCFormat";
import { ConvertableTextFile, ConverterOptions , ParseResults} from "./Converter"
import { ADD, ACN, Matrix } from 'dotadd.js'
import { Parser } from "papaparse";
import { ParseError } from "./Util";


enum ParserState {
    GLOBAL, HRTF_SECT, DEC_MAT, DEFAULT
}

class AmbixConf {
    debug_msg = "";
    coef_scale = "";
    coef_seq = "";
    cflip = 0;
    cflop = 0;
    cflap = 0;
    dec_mat_gain = 1.;
    invert_condon_shortley = false;
    coefs : number[][] = [];
}

@_static_implements<ADCFormat>()
export default class AmbixConfigFormat {

    static shortName(): string{
        return "ambix"
    }

    /**
     * @returns {string} the name of the format
     */
    static getName(): string{
        return "AmbiX Configuration Files"
    }

    /**
     * @returns {string} a string describing the format
     */
    static getDescription(): string {
        return "Read and write configurations files for the AmbiX Plugin Suite by Matthias Kronlachner";
    }

    /**
     * @returns {ContainerType} the container type for this format
     */
    static container_type() : ContainerType {
        return ContainerType.CONFIG;
    }

    /**
     * test if an object can be interpreted by this format
     * @param obj object to test
     */
    static test(obj: Object): boolean {
        return false;
    }

    /**
     * parse the format
     * @param obj object to parse
     * @param filename filename of the parsed object
     * @param carry carried from the last iteration if the parser needs/accepts more than one file
     * @param options converter options
     */
    static parse(file: ConvertableTextFile, filename: string, carry: ParseResults, options: ConverterOptions): void { 

        let add = new ADD();
        let ambix = new AmbixConf();

        let lines = ambixRemoveComments(file.data.split('\n'));

        let pstate = ParserState.DEFAULT;

        lines.forEach(line => pstate = ambixReadLine(ambix, line, pstate)); 

        if(!(ambix.coef_scale.toLowerCase() === 'sn3d' 
            || ambix.coef_scale.toLowerCase() === 'n3d'))
            throw new ParseError(filename + '.config', "Unexpected normalization: '" + ambix.coef_scale + "'");

        ambixDecApplyOptions(ambix);
        ambixDecFillZeroes(ambix);

        add.setName((ambix.debug_msg.length)? ambix.debug_msg : filename)
        add.setDescription("Parsed from ambix decoder configuration file / " + "filename" + ".config");

        add.addMatrix(new Matrix(ambix.coef_scale, ambix.coefs));

        add.setAuthor("Matthias Kronlachner feat. the dotaddtool creators");

        add.createDefaultMetadata();

        add.createDefaultOutputs();

        addMakeImags(add);

        if(add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);

    }

    static fromADD(add: ADD, opts: ConverterOptions): string {
        return "";
    }

};

function ambixDecFillZeroes(ambix: AmbixConf){

    let max_s = ambix.coefs
        .reduce((len: number, row: number[]) => ((len > row.length)? len : row.length), 0);

    ambix.coefs.forEach(row => {
        while(!(row.length === max_s))
            row.push(0);
    });

}

function ambixReadLine(ambix: AmbixConf, line: string, state: ParserState): ParserState {

    switch (state){
        case ParserState.GLOBAL:
            return ambixReadGlobalValue(ambix, line);
        case ParserState.DEC_MAT:
            return ambixReadDecoderRow(ambix, line);
        case ParserState.HRTF_SECT:
            return ambixReadHrtfSection(ambix, line);
        default: 
            return ambixReadDefault(ambix, line);
    }

}   

function ambixReadDefault(ambix: AmbixConf, line: string): ParserState {
    if(line.includes("#GLOBAL"))
        return ParserState.GLOBAL;
    
    if(line.includes("#HRTF"))
        return ParserState.HRTF_SECT;

    if(line.includes("#DECODERMATRIX"))
        return ParserState.DEC_MAT;

    return ParserState.DEFAULT;
}

function ambixReadHrtfSection(ambix: AmbixConf, line: string): ParserState {
    if(line.includes("#END"))
        return ParserState.DEFAULT;
    
    return ParserState.HRTF_SECT;
}

function ambixReadDecoderRow(ambix: AmbixConf, line: string): ParserState {
    if(line.includes("#END"))
        return ParserState.DEFAULT;

    let coefs = line.split(/\s+/).map(str => Number.parseFloat(str));

    ambix.coefs.push(coefs);

    return ParserState.DEC_MAT;
}

function ambixReadGlobalValue(ambix: AmbixConf, line: string): ParserState {

    if(line.includes("#END"))
        return ParserState.DEFAULT;

    let vals = line.split(/\s+/);

    switch(vals.shift()){
        case '/debug_msg':
            ambix.debug_msg = vals.join(" ");
        case '/coeff_scale':
            ambix.coef_scale = <string> vals.shift();
        case '/coeff_seq':
            ambix.coef_seq = <string> vals.shift();
        case '/flip':
            ambix.cflip = Number.parseInt(<string> vals.shift());
        case '/flap':
            ambix.cflap = Number.parseInt(<string> vals.shift());
        case '/flop':
            ambix.cflop = Number.parseInt(<string> vals.shift());
        case '/dec_mat_gain':
            ambix.dec_mat_gain = Number.parseFloat(<string> vals.shift());
        case '/invert_condon_shortley':
            ambix.invert_condon_shortley = Number.parseInt(<string> vals.shift()) === 1;
    }

    return ParserState.GLOBAL;
}

function ambixRemoveComments(lines: string[]){
    return lines.map(line => { return line.split("//")[0].trim(); })
}

function addMakeImags(add: ADD){

    add.decoder.matrices[0].matrix.forEach((row, i) => {
        if(row.reduce( ( is_nul: boolean, coef: number ) => is_nul && ( coef == 0 ), true ))
            add.decoder.output.summing_matrix[i].fill(0);
    });
}


function ambixDecApplyOptions(ambix: AmbixConf){

    let flip = 1, flop = 1, flap = 1, total = 1;

    let flipp = ambix.cflip === 1;
    let flapp = ambix.cflap === 1;
    let flopp = ambix.cflop === 1;

    let cshortley = ambix.invert_condon_shortley;

    if( cshortley || flipp || flapp || flopp ){ 

        ambix.coefs.forEach(row => {

            row.forEach((coef, i)=> {

                let m = ACN.index(i);
                let l = ACN.order(i);

                // this section is copied 1::1 from the kronlachner plugins code

                if( flipp && ( m < 0 ) ) // m < 0 -> invert
                    flip = -1;

                if ( flopp && ( ((m < 0) && !(m % 2)) || ((m >= 0) && (m % 2)) ) ) // m < 0 and even || m >= 0 and odd ()
                    flop = -1;

                if ( flapp && ( (l + m) % 2 ) ) // l+m odd   ( (odd, even) or (even, odd) )
                    flap = -1;

                if (cshortley)
                    total = Math.pow(-1, i) * flip * flop * flap;
                else
                    total = flip * flop * flap;

                row[i] = coef * total;

            });
        });

    }
}
