import { ContainerType, _static_implements, ADCFormat } from "./ADCFormat";
import { ConvertableTextFile, ConverterOptions , ParseResults} from "./Converter"
import { ADD } from 'dotadd.js'

@_static_implements<ADCFormat>()
export default class AmbixConfigFormat {

    static shortName(): string{
        return "ambix"
    }

    /**
     * @returns {string} the name of the format
     */
    static getName(): string{
        return "AmbiX Configuration Files"
    }

    /**
     * @returns {string} a string describing the format
     */
    static getDescription(): string {
        return "Read and write configurations files for the AmbiX Plugin Suite by Matthias Kronlachner";
    }

    /**
     * @returns {ContainerType} the container type for this format
     */
    static container_type() : ContainerType {
        return ContainerType.CONFIG;
    }

    /**
     * test if an object can be interpreted by this format
     * @param obj object to test
     */
    static test(obj: Object): boolean {
        return false;
    }

    /**
     * parse the format
     * @param obj object to parse
     * @param filename filename of the parsed object
     * @param carry carried from the last iteration if the parser needs/accepts more than one file
     * @param options converter options
     */
    static parse(file: ConvertableTextFile, filename: string, carry: ParseResults, options: ConverterOptions): void { 
        console.log(file.data);
    }

    static fromADD(add: ADD, opts: ConverterOptions): string {
        return "";
    }

};