import { ContainerType } from './ADCFormat';
import AmbidecodeCoefs from './AmbidecodeCoefs';
import AmbidecodeSettings from './AmbidecodeSettings';
import IEMFormat from './IEMFormat';
import ADDFormat from './ADDFormat';
import CSVFormat from './CSVFormat';
import { Logger as console } from './Logger';
import { parse as parse_xml } from 'fast-xml-parser';
import * as Papa from 'papaparse';
import AmbdecFormat from './AmbdecFormat';
function containerTypeToString(ty) {
    switch (ty) {
        case ContainerType.CSV:
            return "csv";
        case ContainerType.JSON:
            return "json";
        case ContainerType.XML:
            return "xml";
    }
}
let formats = [
    ADDFormat,
    AmbidecodeCoefs,
    AmbidecodeSettings,
    IEMFormat,
    CSVFormat
];
export var ParserMessageLevels;
(function (ParserMessageLevels) {
    ParserMessageLevels[ParserMessageLevels["note"] = 0] = "note";
    ParserMessageLevels[ParserMessageLevels["warn"] = 1] = "warn";
    ParserMessageLevels[ParserMessageLevels["err"] = 2] = "err";
})(ParserMessageLevels || (ParserMessageLevels = {}));
export class ParserMessage {
    constructor(mess, level) {
        this.message = mess;
        this.level = level;
    }
}
export class ParseResults {
    constructor() {
        this.results = [];
        this.incomplete_results = [];
        this.messages = [];
        this.output_files = [];
    }
}
export class ConvertableTextFile {
    constructor(fname, data) {
        this.filename = fname;
        this.data = data;
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
            console.log("Processing file: " + file.filename);
            console.log("Filetype:        " + ftype);
            if (!(ftype === 'xml'
                || ftype === 'json'
                || ftype === 'add')) {
                if (file.data.charAt(0) === '<')
                    ftype = 'xml';
                else if (file.data.charAt(0) === '{' || file.data.charAt(0) === '[')
                    ftype = 'json';
            }
            file.filename = file.filename.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.');
            switch (ftype) {
                case 'json':
                    this._do_parse_json(file, results, options);
                    break;
                case 'xml':
                    this._do_parse_xml(file, results, options);
                    break;
                case 'add':
                    this._do_parse_add(file, results, options);
                    break;
                case 'csv':
                    this._do_parse_csv(file, results, options);
                    break;
                case 'ambdec':
                    this._do_parse_ambdec(file, results, options);
                    break;
                case 'config':
                    break;
            }
        }
        console.log("Applying command line options");
        this._do_apply_options(results, options);
        this._do_convert(results, options);
        return results;
    },
    _do_convert(carry, opts) {
        let ofopt = opts.use('format');
        let output = opts.use('output');
        let fileext = "", format;
        if (output)
            fileext = output.slice((output.lastIndexOf(".") - 1 >>> 0) + 2);
        if (ofopt)
            format = ofopt;
        else if (fileext.length)
            format = fileext;
        else
            format = 'add';
        let converter = formats.find(frm => frm.shortName() == format);
        if (converter) {
            console.log("Using '" + converter.getName() + "' exporter");
            carry.results.forEach(res => {
                let data = converter.fromADD(res, opts);
                console.log("Producing output: '" + res.name + "', format: '" + format + "', container: " + containerTypeToString(converter.container_type()));
                carry.output_files.push({
                    name: res.name,
                    format: format,
                    container: containerTypeToString(converter.container_type()),
                    data: data
                });
            });
        }
        else
            throw new Error("Exporter '" + format + "' not found");
    },
    _do_apply_options(carry, opts) {
        let mopts = {
            description: opts.use('description'),
            name: opts.use('name'),
            author: opts.use('author'),
            version: opts.use('version'),
            norm: opts.use('norm'),
            renormalize: opts.use('reNorm'),
        };
        carry.results.forEach(res => this._do_apply_options_impl(res, mopts));
        carry.incomplete_results.forEach(res => this._do_apply_options_impl(res, mopts));
        let restash = [];
        while (carry.incomplete_results.length) {
            let add = carry.incomplete_results.shift();
            if (add) {
                console.log("reevaluating ADD '" + add.name + "'");
                if (add.valid()) {
                    console.log("is valid now, appending to valid results");
                    carry.results.push(add);
                }
                else {
                    restash.push(add);
                    console.log("still invalid");
                }
            }
        }
        carry.incomplete_results.push(...restash);
    },
    _do_apply_options_impl(add, opts) {
        if (opts.author && typeof opts.author == 'string') {
            console.log("setting author: " + opts.author);
            add.setAuthor(opts.author);
        }
        if (opts.name && typeof opts.name == 'string') {
            console.log("setting name: " + opts.name);
            add.setName(opts.name);
        }
        if (opts.description && typeof opts.description == 'string') {
            console.log("setting description: " + opts.description);
            add.setDescription(opts.description);
        }
        if (opts.hasOwnProperty('version') && typeof opts.version == 'number') {
            console.log("setting version: " + opts.version);
            add.setVersion(Number.parseInt(opts.version));
        }
        if (opts.hasOwnProperty('norm') && typeof opts.norm == 'string') {
            console.log("setting normalisation: " + opts.norm);
            add.decoder.matrices.forEach((dec) => dec.setNormalisation(opts.norm));
        }
        if (opts.renormalize && typeof opts.renormalize == 'string') {
            console.log("renormalizing matrices to " + opts.renormalize);
            if (opts.renormalize.toLowerCase() == 'sn3d' ||
                opts.renormalize.toLowerCase() == 'n3d') {
                add.decoder.matrices.forEach(mat => mat.renormalizeTo(opts.renormalize));
            }
        }
    },
    _do_parse_json(file, carry, opts) {
        this._do_parse_native(file, carry, opts, JSON.parse(file.data), ContainerType.JSON);
    },
    _do_parse_xml(file, carry, opts) {
        this._do_parse_native(file, carry, opts, parse_xml(file.data, { ignoreAttributes: false }), ContainerType.XML);
    },
    _do_parse_add(file, carry, opts) {
        console.log("Loading .add file '" + file.filename + "'");
        ADDFormat.parse(JSON.parse(file.data), file.filename, carry, opts);
    },
    _do_parse_csv(file, carry, opts) {
        console.log("Parsing CSV file '" + file.filename + "'");
        CSVFormat.parse(Papa.parse(file.data), file.filename, carry, opts);
    },
    _do_parse_ambdec(file, carry, opts) {
        console.log("Parsing ambdec file '" + file.filename + "'");
        AmbdecFormat.parse(file, file.filename, carry, opts);
    },
    _do_parse_ambix_config(file, carry, opts) {
    },
    _do_parse_native(file, carry, opts, obj, container_type) {
        let parsers_to_try = [];
        for (let format of formats) {
            if (format.container_type() === container_type && format.test(obj))
                parsers_to_try.push(format);
        }
        console.log("Parsing '" + file.filename + "' with '" + parsers_to_try.map(p => p.getName() + "' parser"));
        parsers_to_try.forEach(parser => parser.parse(obj, file.filename, carry, opts));
    }
};
