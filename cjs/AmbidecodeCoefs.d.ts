import { ContainerType } from "./ADCFormat";
import { ParseResults, ConverterOptions } from './Converter';
import { ADD } from 'dotadd.js';
export default class AmbidecodeCoefs {
    static shortName(): string;
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: Object): Boolean;
    static parse(obj: any, filename: string, carry: ParseResults, opts: ConverterOptions): void;
    static fromADD(add: ADD): string;
}
