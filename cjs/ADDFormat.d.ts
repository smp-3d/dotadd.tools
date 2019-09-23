import { ContainerType } from "./ADCFormat";
import { ParseResults, ConverterOptions } from './Converter';
import { ADD } from 'dotadd.js';
export default class ADDFormat {
    static shortName(): string;
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: any): Boolean;
    static parse(obj: object, filename: string, carry: ParseResults, opts: ConverterOptions): void;
    static fromADD(add: ADD): string;
}
