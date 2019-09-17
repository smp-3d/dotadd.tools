import { ContainerType } from "./ADCFormat";
import { ParseResults, ConverterOptions } from './Converter';
export default class ADDFormat {
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: any): Boolean;
    static parse(obj: object, filename: string, carry: ParseResults, opts: ConverterOptions): void;
}
