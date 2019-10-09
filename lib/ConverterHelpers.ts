import { ADD } from 'dotadd.js';

import ADDFormat from './ADDFormat';
import { ADCFormat } from './ADCFormat';

export const Helpers = {

    _file(p: string) {
        return p.replace(/^.*[\\\/]/, '');
    },

    _fname(p: string) {
        return p.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.');
    },

    _fext(p: string) {
        return p.slice((p.lastIndexOf(".") - 1 >>> 0) + 2);
    },

    _path(p: string) {

        let _p = p.substring(0, p.lastIndexOf("/"));

        return (_p.length ? _p : '.');
    }

}

export enum ConverterMessageLevel {
    note, warn, err
}

export enum ConverterMessageStage {
    read, parse, convert, export, write
}

export class ConverterMessage {

    constructor(mess: string, level: ConverterMessageLevel, stage: ConverterMessageStage) {
        this.message = mess;
        this.level = level;
        this.stage = stage;
    }

    message: string;
    level: ConverterMessageLevel;
    stage: ConverterMessageStage;
}

export class ConverterTarget {

    constructor(input_f: ConverterFile)
    constructor(input_f: ConverterFile[] | ConverterFile) {

        if (Array.isArray(input_f))
            this.input_files = input_f;
        else if (input_f instanceof ConverterFile)
            this.input_files = [input_f];
        else
            throw new Error("Cannot construct ConverterTarget from arguments: ");

        this.target_files = [this.input_files[0].withExt('add', {})];

    }

    input_files: ConverterFile[];
    output_files: ConverterFile[] | undefined;

    parser_result: ADD | undefined;

    target_format: any = ADDFormat;

    target_files: ConverterFile[] | undefined;

    applied_options: ConverterOption[] = []

}

export class ConversionProcessData {

    results: ADD[] = [];

    incomplete_results: ADD[] = [];

    messages: ConverterMessage[] = [];

    output_files: {
        name: string
        format: string,
        container: string,
        data: string,
        add: ADD
    }[] = [];

}

export class ConvertableTextFile {

    constructor(fname: string, data: string) {
        this.filename = fname;
        this.data = data;
    }

    filename: string;
    data: string;
}

export class ConverterFile {

    fname: string;

    fty: string;

    cty: string;

    data: string;
    fullpath: string | undefined;

    native_object_in: object | undefined;
    native_object_out: object | undefined;

    parser: string | undefined;

    constructor(filename: string, data: string, options?: { ty?: string, cty?: string, path?: string }) {

        this.fname = filename;

        this.data = data;

        this.fty = (options) ? (options.ty) ?
            options.ty : Helpers._fext(filename) : Helpers._fext(filename);

        this.cty = (options) ? (options.cty) ?
            options.cty : Helpers._fext(filename) : Helpers._fext(filename);

        if (options)
            this.fullpath = options.path;

    }

    title(): string {
        return Helpers._fname(this.fname);
    }

    filenameWithExt(ext: string): string {
        return `${Helpers._fname(this.fname)}.${ext}`
    }

    withExt(ext: string, options: { ty?: string, cty?: string, path?: string }) {

        let new_fname = this.filenameWithExt(ext);

        let new_path = (options) ? (options.path) ? options.path : undefined : undefined;

        if (!(new_path)) {
            if (this.fullpath)
                new_path = `${Helpers._path(this.fullpath)}/${Helpers._fname(this.fullpath)}.${ext}`;
        }


        let opts = {
            ty: (options) ? (options.ty) ? options.ty : "" : "",
            cty: (options) ? (options.cty) ? options.cty : ext : ext,
            path: new_path
        }

        return new ConverterFile(new_fname, this.data, opts);
    }

    static fromPath(fullpath: string, data: string, options: { ty?: string, path?: string }) {

        let fname = Helpers._file(fullpath);

        console.log(fname);

        return new ConverterFile(fname, data, { ty: options ? options.ty : undefined, path: fullpath });

    }

}

export class ConverterOption {

    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }

    type(): string { return typeof this.value; }

    peek(): any { return this.value; }

    wasUsed() { return this.used; }

    use(): any {
        this.used = true;
        return this.value;
    }

    name: string;

    value: any;
    used: boolean = false;
}

export class ConverterOptions {

    constructor();
    constructor(...args: ConverterOption[]) {
        this.options = args;
    }

    has(name: string): boolean {
        return this.options.find(opt => opt.name === name) != undefined;
    }

    get(name: string): ConverterOption | undefined {
        return this.options.find(opt => opt.name === name);
    }

    use(name: string): any {

        let opt = this.get(name);

        if (opt)
            return opt.use();

    }

    getUnused(): ConverterOption[] {

        return this.options.reduce((carry, current) => {
            !current.used ? carry.push(current) : null;
            return carry;
        },
            [] as ConverterOption[]);
    }

    options: ConverterOption[] = [];
}

export class ConverterData {

    parser_results: ConverterTarget[] = [];

    incomplete_results: ConverterTarget[] = [];

    converter_results: ConverterTarget[] = [];

    messages: ConverterMessage[] = [];

    parseError(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.err, ConverterMessageStage.parse));
    }

    parseWarn(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.warn, ConverterMessageStage.parse));
    }

    parseMsg(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.note, ConverterMessageStage.parse));
    }

    convertError(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.err, ConverterMessageStage.convert));
    }

    convertWarn(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.warn, ConverterMessageStage.convert));
    }

    convertMsg(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.note, ConverterMessageStage.convert));
    }

    exportError(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.err, ConverterMessageStage.export));
    }

    exportWarn(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.warn, ConverterMessageStage.export));
    }

    exportMsg(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.note, ConverterMessageStage.export));
    }

    readError(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.err, ConverterMessageStage.read));
    }

    readWarn(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.warn, ConverterMessageStage.read));
    }

    readMsg(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.note, ConverterMessageStage.read));
    }

    writeError(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.err, ConverterMessageStage.write));
    }

    writeWarn(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.warn, ConverterMessageStage.write));
    }

    writeMsg(msg: string) {
        this.messages.push(new ConverterMessage(msg, ConverterMessageLevel.note, ConverterMessageStage.write));
    }

}
