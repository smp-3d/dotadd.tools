import { ContainerType } from "./ADCFormat";
import { ConvertableTextFile, ConverterOptions, ParseResults } from "./Converter";
import { ADD } from 'dotadd.js';
export default class AmbixConfigFormat {
    static shortName(): string;
    /**
     * @returns {string} the name of the format
     */
    static getName(): string;
    /**
     * @returns {string} a string describing the format
     */
    static getDescription(): string;
    /**
     * @returns {ContainerType} the container type for this format
     */
    static container_type(): ContainerType;
    /**
     * test if an object can be interpreted by this format
     * @param obj object to test
     */
    static test(obj: Object): boolean;
    /**
     * parse the format
     * @param obj object to parse
     * @param filename filename of the parsed object
     * @param carry carried from the last iteration if the parser needs/accepts more than one file
     * @param options converter options
     */
    static parse(file: ConvertableTextFile, filename: string, carry: ParseResults, options: ConverterOptions): void;
    static fromADD(add: ADD, opts: ConverterOptions): string;
}
