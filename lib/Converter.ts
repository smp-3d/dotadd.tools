import { ADCFormat, ContainerType } from './ADCFormat';
import AmbidecodeFormat from './AmbidecodeFormat';
import IEMFormat from './IEMFormat';

import { ADD } from 'dotadd.js';

import { parse as parse_xml } from 'fast-xml-parser';

let formats = [
    AmbidecodeFormat,
    IEMFormat
] as ADCFormat[];

export class ParseResults {
    results: ADD[] = [];
}

export class ConvertableTextFile {
    filename: string = "";
    data: string = "";
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

export const Converter = {

    convert_string(files: ConvertableTextFile[], options: ConverterOptions) {

        let results = new ParseResults();

        for (let file of files) {

            let ftype = file.filename.slice((file.filename.lastIndexOf(".") - 1 >>> 0) + 2);

            if (!(ftype === 'xml' || ftype === 'json' || ftype === 'add')) {
                if (file.data.charAt(0) === '<')
                    ftype = 'xml';
                else if (file.data.charAt(0) === '{' || file.data.charAt(0) === '[')
                    ftype = 'json';
            }

            switch (ftype) {
                case 'json':
                    this._do_parse_json(file, results, options);
                case 'xml':
                    this._do_parse_json(file, results, options);
                case 'add':
                    this._do_parse_add(file, results, options);
            }

        }
    },

    convert_binary(filename: string, data: Uint8Array, options: ConverterOptions) {

    },

    list_formats() {

    },

    _do_parse_json(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions) {
        this._do_parse_native(file, carry, opts, JSON.parse(file.data), ContainerType.JSON);
    },

    _do_parse_xml(file: ConvertableTextFile, 
                    carry: ParseResults, 
                    opts: ConverterOptions) {

        this._do_parse_native(file, carry, opts, 
                                parse_xml(file.data, { ignoreAttributes: false }), 
                                ContainerType.XML);
    },

    _do_parse_add(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions) {

    },

    _do_parse_native(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions, 
                        obj: Object, container_type: ContainerType) {

        let parsers_to_try = [] as ADCFormat[];

        for (let format of formats) {
            if (format.container_type() === container_type && format.test(obj))
                parsers_to_try.push(format);
        }

        parsers_to_try.forEach(parser => parser.parse(obj, file.filename, carry, opts));

    }

}