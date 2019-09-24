import { ContainerType } from './ADCFormat';
import { ParseResults, ConverterOptions } from './Converter';
import { ADD } from 'dotadd.js';
export default class IEMFormat {
    static shortName(): string;
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: any): Boolean;
    static parse(obj: any, filename: string, carry: ParseResults): void;
    static fromADD(add: ADD, opts: ConverterOptions): string;
}
