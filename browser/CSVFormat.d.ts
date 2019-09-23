import { ADD } from 'dotadd.js';
import { ParseResults, ConverterOptions } from './Converter';
import { ContainerType } from './ADCFormat';
export default class CSVFormat {
    static shortName(): string;
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: any): boolean;
    static parse(obj: any, filename: string, carry: ParseResults, opts: ConverterOptions): void;
    static fromADD(add: ADD): string;
}
