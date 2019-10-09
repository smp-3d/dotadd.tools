import { ADD, Matrix, AEDCoord, Filter, OutputChannel, ACN } from 'dotadd.js';
import { ConversionProcessData, ConverterOptions, ConvertableTextFile, ConverterFile } from './ConverterHelpers'
import { ADCFormat, _static_implements, ContainerType } from './ADCFormat'
import { ParseError } from './Util';

class Ambdec {
    normalisation = "";
    xover = 0;
    xover_ratio = 0;

    hfmtx: number[][] = [];
    lfmtx: number[][] = [];

    mtx: number[][] = [];

    spks = <{ coord: AEDCoord, name: string }[]>[];

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
        return ContainerType.AMBDEC;
    }

    static test(obj: any): boolean {
        return false;
    }

    static test2(f: ConverterFile): boolean {
        return false;
    }


    static parse(file: ConvertableTextFile, filename: string, carry: ConversionProcessData, opts: ConverterOptions) {

        let add = new ADD();

        let lines = file.data.split('\n');

        let ambdec = new Ambdec();

        let parser_state = ParserState.COMMANDS;
        let current_matrix = '';

        lines.forEach((line: string, index: number) => {

            line = line.trim();

            line = line.split('#')[0];

            if (!line.length)
                return;

            if (line.charAt(0) == '/') {

                let cmd = parseAmbdecCommand(line);

                switch (cmd.name) {

                    case '/description':
                        if (cmd.value && cmd.value.length)
                            add.setName(cmd.value);
                        else
                            add.setName("ambdec_file");
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

                switch (parser_state) {
                    case ParserState.MATRIX:
                        doParseMatrix(line, current_matrix, ambdec);
                        break;
                    case ParserState.SPEAKERS:
                        doParseSpeaker(line, ambdec);
                        break;
                }
            }

        });

        if (ambdec.normalisation.toLowerCase() != 'sn3d'
            && ambdec.normalisation.toLowerCase() != 'n3d')
            throw new ParseError(filename, "Unexpected normalisation: " + ambdec.normalisation);



        add.setDescription("Parsed from ambdec configuration file '" + filename + "'");

        if (ambdec.hfmtx.length && ambdec.lfmtx.length) {

            add.addFilter(Filter.makeLowpass("lfmatrix", 0, ambdec.xover));
            add.addFilter(Filter.makeHighpass("hfmatrix", 0, ambdec.xover));

            add.addMatrix(new Matrix(ambdec.normalisation, ambdec.lfmtx));
            add.addMatrix(new Matrix(ambdec.normalisation, ambdec.hfmtx));

        } else if (ambdec.mtx) {
            add.addMatrix(new Matrix(ambdec.normalisation, ambdec.mtx));
        }

        let acnmask: number[] = [];

        if (ambdec.chmask.length)
            acnmask = Number.parseInt("0x" + ambdec.chmask)
                .toString(2).split('').map(s => Number.parseInt(s));
        else
            acnmask = new Array(ambdec.mtx[0].length).fill(1);

        add.decoder.matrices.forEach(mat => {

            mat.matrix.forEach((ch, i) => {

                let new_ch: number[] = [];

                acnmask.forEach(nfill => {
                    new_ch.push((nfill) ? <number>ch.shift() : 0);
                });

                mat.matrix[i] = new_ch;

            });
        });

        ambdec.spks.forEach(spk => {
            add.addOutput(new OutputChannel(spk.name, 'spk', spk.coord));
        });

        for (let i = 0; i < add.numOutputs(); ++i) {

            add.decoder.output.summing_matrix.push(
                new Array(add.totalMatrixOutputs()).fill(0)
            )

            add.decoder.output.summing_matrix[i][i] = 1;

            if (add.decoder.filters.length)
                add.decoder.output.summing_matrix[i][i + add.numOutputs()] = 1;
        }

        add.createDefaultMetadata();

        if (add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }

    static fromADD(add: ADD): string {

        ambdecRemoveImagSpeakers(add);

        let pair = ambdecFindXoverPair(add.decoder.filters);

        let dualband = false;

        let xover_f = 0;

        if (pair) {
            xover_f = add.decoder.filters[pair.h].low;
            dualband = true;
        }

        let out = { str: "# created with dotaddtool " + new Date(Date.now()).toUTCString() + "\n\n" };

        ambdecAppendValue(out, "description\t", add.name + "/" + add.description);

        ambdecAppendNewlines(out, 1);

        ambdecAppendValue(out, "version", "\t" + ((add.version) ? +add.version : 0));

        ambdecAppendNewlines(out, 1);

        ambdecAppendValue(out, 'dec/chan_mask', "\t" + adjustMatrixAndGetChannelMask(add.decoder.matrices));
        ambdecAppendValue(out, 'dec/freq_bands', ((add.decoder.filters.length) ? "2" : "1"));
        ambdecAppendValue(out, 'dec/speakers', "\t" + add.decoder.output.channels.length);
        ambdecAppendValue(out, 'dec/coeff_scale', add.decoder.matrices[0].getNormalization());

        ambdecAppendNewlines(out, 1);

        ambdecAppendValue(out, 'out/input_scale', add.decoder.matrices[0].getNormalization());
        ambdecAppendValue(out, 'out/nfeff_comp', 'output');
        ambdecAppendValue(out, 'out/delay_comp', 'off'),
            ambdecAppendValue(out, 'out/level_comp', 'off'),
            ambdecAppendValue(out, 'out/xover_freq', "" + xover_f);
        ambdecAppendValue(out, 'out/xover_ratio', '0');

        ambdecAppendNewlines(out, 3);

        ambdecAppendSpeakers(out, add);

        ambdecAppendNewlines(out, 2);

        if (!dualband)
            ambdecWriteMatrix(out, add.decoder.matrices[0].matrix, 'r');
        else {
            if (pair) {
                ambdecWriteMatrix(out, add.decoder.matrices[pair.l].matrix, 'lf');
                ambdecAppendNewlines(out, 1);
                ambdecWriteMatrix(out, add.decoder.matrices[pair.h].matrix, 'hf');
            }
        }

        return out.str;
    }

}

enum ParserState {
    COMMANDS,
    SPEAKERS,
    MATRIX
}

function parseAmbdecCommand(line: string): { name: string, value: any } {

    let elems = line.split(/\s+|,/)
        .map(s => s.trim())
        .filter((s: string) => s.length);

    if (elems[0] == '/}')
        return { name: 'end_mat', value: null };

    if (elems.length == 1)
        return { name: elems[0], value: null };

    if (elems.length > 1)
        return { name: <string>elems.shift(), value: elems.join("_") };

    return { name: "", value: "" };

}

function doParseMatrix(line: string, current_mtx: string, ambdec: Ambdec) {

    let elems = line.trim().split(/\s+/).map(el => el.trim()).filter(el => el.length);

    if (elems.shift() == 'add_row') {

        let coefs = elems.map(str => Number.parseFloat(str));

        switch (current_mtx) {
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

function doParseSpeaker(line: string, ambdec: Ambdec) {

    let elems = line.trim().split(/\s+/)
        .map((el: string) => el.trim())
        .filter((el: string) => el.length);

    if (elems.shift() == 'add_spkr') {

        let el_name = elems.shift();

        let crs = elems.map(str => Number.parseFloat(str));

        ambdec.spks.push({
            coord: new AEDCoord(crs[1], crs[2], crs[0]),
            name: <string>el_name
        });
    }
}

function ambdecAppendNewlines(out: { str: string }, lines: number) {
    for (let i = 0; i < lines; ++i)
        out.str = out.str + "\n";
}

function ambdecAppendLine(out: { str: string }, line: string) {
    out.str = out.str + line + "\n";
}

function ambdecAppendValue(out: { str: string }, name: string, value?: string) {
    out.str = out.str + '/' + name + ((value) ? " \t" + value + "\n" : "\n");
}

function ambdecSectionEnd(out: { str: string }) {
    ambdecAppendValue(out, "}");
}

function ambdecWriteMatrix(out: { str: string }, matrix: number[][], type: string) {

    let mat_begin = "";

    switch (type) {
        case "lf":
            mat_begin = "hfmatrix/{";
            break;
        case "hf":
            mat_begin = "lfmatrix/{";
            break;
        case "r":
            mat_begin = "matrix/{"
            break;
    }

    ambdecAppendValue(out, mat_begin);

    let order = ACN.order(matrix[0].length);
    let order_gain_line = "order_gain"

    for (let i = 0; i < order; ++i)
        order_gain_line = order_gain_line + "\t1.0"

    ambdecAppendLine(out, order_gain_line);

    matrix.forEach(ch => {
        ambdecAppendLine(out, "add_row " + ch.join("  "));
    });

    ambdecSectionEnd(out);
}

function adjustMatrixAndGetChannelMask(mtx: Matrix[]): string {

    let num_coeffs = 0;
    let mat_idx = 0;

    // find the largest matrix
    mtx.forEach((mat, idx) => {
        if (mat.numCoeffs() > num_coeffs) {
            mat_idx = idx;
            num_coeffs = mat.numCoeffs();
        }
    })

    let map: boolean[] = [];

    // create a map of only zero values
    for (let i = 0; i < num_coeffs; ++i)
        map.push(mtx[mat_idx].matrix
            .reduce((carry: boolean, arr: number[]) => (arr[i] == 0) && carry, true));



    mtx.forEach((mat, idx) => {

        if (idx === mat_idx)
            return;

        map.forEach((cf, i) => {

            map[i] = map[i] && mat.matrix
                .reduce((carry: boolean, arr: number[]) => (arr[i] == 0) && carry, true);

        });

    });

    mtx.forEach((mat, idx) => {

        mat.matrix.forEach((ch, i) => {

            let new_arr: number[] = [];

            map.forEach(f => {
                if (!f)
                    new_arr.push(<number>ch.shift());
                else
                    ch.shift();
            });

            mat.matrix[i] = new_arr;

        });

    });

    return Number.parseInt(map.map(b => b ? "0" : "1").join(""), 2).toString(16);

}

function ambdecAppendSpeakers(out: { str: string }, add: ADD) {

    ambdecAppendValue(out, 'speakers/{');

    add.decoder.output.channels.forEach((ch, i) => {
        out.str = out.str +
            `add_spkr\t${
            (ch.name && ch.name.length) ? ch.name.split(/\s+/).join("_") : "spk" + i
            }\t${
            (ch.coords) ? (ch.coords.d) ? ch.coords.d : "1.0" : "1.0"
            }\t${
            (ch.coords) ? ch.coords.a : "0"
            }\t${
            (ch.coords) ? ch.coords.e : "0"
            }\n`;
    })

    ambdecSectionEnd(out);
}

function ambdecFindXoverPair(filters: Filter[]): { h: number, l: number } | undefined {

    try {
        filters.forEach((flt, idx) => {
            filters.forEach((flt2, idx2) => {

                if (idx === idx2)
                    return;

                if (flt.isHighpass() && flt2.isLowpass()) {
                    if (flt.low == flt2.high)
                        throw { h: idx, l: idx2 };
                }

                if (flt.isLowpass() && flt2.isHighpass()) {
                    if (flt.high == flt2.low)
                        throw { h: idx2, l: idx };
                }

            });
        })
    } catch (result) {
        return result;
    }
}

function ambdecChannelMaskForOrder(order: number) {
    return Number.parseInt(new Array(ACN.maxChannels(order)).fill(1).join(""), 2).toString(16);
}

function ambdecRemoveImagSpeakers(add: ADD) {

    let new_chs: OutputChannel[] = [];
    let new_summing_mtx: number[][] = [];

    add.decoder.output.channels.forEach((ch, idx) => {

        if (!(add.decoder.output.summing_matrix[idx].reduce((is_null, c) => is_null && (c == 0), true))) {
            new_summing_mtx.push(add.decoder.output.summing_matrix[idx]);
            new_chs.push(add.decoder.output.channels[idx]);
        }

    });

    add.decoder.output.channels = new_chs;
    add.decoder.output.summing_matrix = new_summing_mtx;

}