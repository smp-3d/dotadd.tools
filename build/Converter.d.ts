import { ContainerType } from './ADCFormat';
import { ADD } from 'dotadd.js';
export declare enum ParserMessageLevels {
    note = 0,
    warn = 1,
    err = 2
}
export declare class ParserMessage {
    constructor(mess: string, level: ParserMessageLevels);
    message: string;
    level: ParserMessageLevels;
}
export declare class ParseResults {
    results: ADD[];
    incomplete_results: ADD[];
    messages: ParserMessage[];
    output_files: {
        name: string;
        format: string;
        container: string;
        data: string;
    }[];
}
export declare class ConvertableTextFile {
    constructor(fname: string, data: string);
    filename: string;
    data: string;
}
export declare class ConverterOption {
    constructor(name: string, value: any);
    type(): string;
    peek(): any;
    wasUsed(): boolean;
    use(): any;
    name: string;
    value: any;
    used: boolean;
}
export declare class ConverterOptions {
    constructor();
    has(name: string): boolean;
    get(name: string): ConverterOption | undefined;
    use(name: string): any;
    getUnused(): ConverterOption[];
    options: ConverterOption[];
}
export declare const Converter: {
    convert_string(files: ConvertableTextFile[], options: ConverterOptions): ParseResults;
    _do_convert(carry: ParseResults, opts: ConverterOptions): void;
    _do_apply_options(carry: ParseResults, opts: ConverterOptions): void;
    _do_apply_options_impl(add: ADD, opts: any): void;
    _do_parse_json(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_xml(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_add(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_csv(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_native(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions, obj: Object, container_type: ContainerType): void;
};
