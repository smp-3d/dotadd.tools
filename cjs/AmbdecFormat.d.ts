import { ADD } from 'dotadd.js';
import { ParseResults, ConverterOptions } from './Converter';
import { ContainerType } from './ADCFormat';
export default class AmbdecFormat {
    static shortName(): string;
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: any): boolean;
    static parse(obj: Object, filename: string, carry: ParseResults, opts: ConverterOptions): void;
    static fromADD(add: ADD): string;
}
