import { ContainerType } from './ADCFormat';
import { ADD } from 'dotadd.js';
export declare class ParseResults {
    results: ADD[];
}
export declare class ConvertableTextFile {
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
    convert_string(files: ConvertableTextFile[], options: ConverterOptions): void;
    convert_binary(filename: string, data: Uint8Array, options: ConverterOptions): void;
    list_formats(): void;
    _do_parse_json(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_xml(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_add(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions): void;
    _do_parse_native(file: ConvertableTextFile, carry: ParseResults, opts: ConverterOptions, obj: Object, container_type: ContainerType): void;
};
