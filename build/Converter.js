import { ContainerType } from './ADCFormat';
import AmbidecodeFormat from './AmbidecodeFormat';
import IEMFormat from './IEMFormat';
import { parse as parse_xml } from 'fast-xml-parser';
let formats = [
    AmbidecodeFormat,
    IEMFormat
];
export class ParseResults {
    constructor() {
        this.results = [];
    }
}
export class ConvertableTextFile {
    constructor() {
        this.filename = "";
        this.data = "";
    }
}
export class ConverterOption {
    constructor(name, value) {
        this.used = false;
        this.name = name;
        this.value = value;
    }
    type() { return typeof this.value; }
    peek() { return this.value; }
    wasUsed() { return this.used; }
    use() {
        this.used = true;
        return this.value;
    }
}
export class ConverterOptions {
    constructor(...args) {
        this.options = [];
        this.options = args;
    }
    has(name) {
        return this.options.find(opt => opt.name === name) != undefined;
    }
    get(name) {
        return this.options.find(opt => opt.name === name);
    }
    use(name) {
        let opt = this.get(name);
        if (opt)
            return opt.use();
    }
    getUnused() {
        return this.options.reduce((carry, current) => {
            !current.used ? carry.push(current) : null;
            return carry;
        }, []);
    }
}
export const Converter = {
    convert_string(files, options) {
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
    convert_binary(filename, data, options) {
    },
    list_formats() {
    },
    _do_parse_json(file, carry, opts) {
        this._do_parse_native(file, carry, opts, JSON.parse(file.data), ContainerType.JSON);
    },
    _do_parse_xml(file, carry, opts) {
        this._do_parse_native(file, carry, opts, parse_xml(file.data, { ignoreAttributes: false }), ContainerType.XML);
    },
    _do_parse_add(file, carry, opts) {
    },
    _do_parse_native(file, carry, opts, obj, container_type) {
        let parsers_to_try = [];
        for (let format of formats) {
            if (format.container_type() === container_type && format.test(obj))
                parsers_to_try.push(format);
        }
        parsers_to_try.forEach(parser => parser.parse(obj, file.filename, carry, opts));
    }
};
