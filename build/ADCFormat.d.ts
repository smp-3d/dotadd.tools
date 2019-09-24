import { ParseResults, ConverterOptions } from './Converter';
import { ADD } from 'dotadd.js';
export declare enum ContainerType {
    XML = 0,
    JSON = 1,
    CSV = 2,
    AMBDEC = 3,
    CONFIG = 4
}
export declare function _static_implements<T>(): <U extends T>(constructor: U) => void;
interface ADCFormatBase {
}
/**
 * Interface for a parsable Ambisonic Decoder Description Format
 */
export interface ADCFormat {
    new (): ADCFormatBase;
    shortName(): string;
    /**
     * @returns {string} the name of the format
     */
    getName(): string;
    /**
     * @returns {string} a string describing the format
     */
    getDescription(): string;
    /**
     * @returns {ContainerType} the container type for this format
     */
    container_type(): ContainerType;
    /**
     * test if an object can be interpreted by this format
     * @param obj object to test
     */
    test(obj: Object): Boolean;
    /**
     * parse the format
     * @param obj object to parse
     * @param filename filename of the parsed object
     * @param carry carried from the last iteration if the parser needs/accepts more than one file
     * @param options converter options
     */
    parse(obj: Object, filename: string, carry: ParseResults, options: ConverterOptions): void;
    fromADD(add: ADD, opts: ConverterOptions): string;
}
export {};
