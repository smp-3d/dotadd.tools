import { ContainerType } from './ADCFormat';
import { ParseResults } from './Converter';
export default class IEMFormat {
    static getName(): string;
    static getDescription(): string;
    static container_type(): ContainerType;
    static test(obj: Object): Boolean;
    static parse(obj: Object, filename: string, carry: ParseResults): void;
}
