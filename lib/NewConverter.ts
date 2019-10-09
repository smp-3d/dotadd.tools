import {
    ConvertableTextFile,
    ConverterOption,
    ConverterOptions,
    ConversionProcessData,
    ConverterFile,
    ConverterData,
    ConverterMessage,
    Helpers
} from './ConverterHelpers'

import { ADCFormat, ContainerType } from './ADCFormat';
// import { Logger as console } from './Logger';

import { ADD, Matrix } from 'dotadd.js';

import { parse as parse_xml } from 'fast-xml-parser';
import * as Papa from 'papaparse';

import { ParseError } from './Util';

import AmbidecodeCoefs from './AmbidecodeCoefs';
import AmbidecodeSettings from './AmbidecodeSettings';
import IEMFormat from './IEMFormat';
import ADDFormat from './ADDFormat';
import CSVFormat from './CSVFormat';
import AmbdecFormat from './AmbdecFormat';
import AmbixConfigFormat from './AmbixConfigFormat';

function _find_cty_from_ext(file: ConverterFile, data: ConverterData): boolean {

    switch (file.fty) {
        case 'json':
            return _try_parse_impl("json", file, data, JSON.parse);
        case 'xml':
            return _try_parse_impl("xml", file, data, parse_xml, { ignoreAttributes: true });
        case 'add':
            return _try_parse_impl("json", file, data, JSON.parse);
        case 'csv':
            return _try_parse_impl("csv", file, data, Papa.parse);
        case 'ambdec':
            file.cty = 'ambdec';
            return true;
        case 'config':
            file.fty = 'ambix';
            file.cty = 'config';
            return true;
        default:
            return false;
    }

}

function _find_cty_from_cont(file: ConverterFile, data: ConverterData): boolean {

    if (_try_parse_impl("xml", file, data, parse_xml, { ignoreAttributes: true }))
        return true;

    if (_try_parse_impl("json", file, data, JSON.parse))
        return true;

    if (_try_parse_impl("csv", file, data, Papa.parse))
        return true;

    return false;

}

function _try_parse_impl(name: string,
    file: ConverterFile,
    data: ConverterData,
    parser: Function,
    ...args: any[]): boolean {

    args.unshift(file.data.toString());

    let obj: object;

    console.log(`running ${name} parser with args:${
        args.map(arg => " " + typeof (arg[0]))}`);

    try {
        obj = parser.apply(null, args);
    } catch (ex) {
        console.log("returned '" + ex.message + "'");
        console.log("not using parser '" + name + "'");
        return false;
    }

    if (obj) {
        file.native_object_in = obj;
        return true;
    }
    return false;
}

function _fix_container_types(files: ConverterFile[], data: ConverterData): void {

    files.forEach(f => {

        let sucess = false;

        if (!f.fty.length)
            sucess = _find_cty_from_cont(f, data);
        else
            sucess = _find_cty_from_ext(f, data);

        if (!sucess)
            throw new ParseError(f.fname, "could not find filetype");

    })

}

function _fix_filetypes(files: ConverterFile[], data: ConverterData) {

    files.forEach(fl => {

        if (fl.parser && fl.parser.length)
            return;

        for (let fmt of Converter.formats) {

            if (fmt.test2(fl))
                return fl.parser = fmt.shortName();
        }

        data.readError("Could not match format parser for file: " + fl.fname);
    });

}

export const Converter = {

    formats: [
        ADDFormat,
        AmbidecodeCoefs,
        AmbidecodeSettings,
        IEMFormat,
        CSVFormat,
        AmbdecFormat,
        AmbixConfigFormat
    ] as ADCFormat[],

    convert(files: ConverterFile[], options: ConverterOptions) {

        // empty object that will eny part of the conversion process
        // access to all the data
        const cv_data = new ConverterData();

        _fix_container_types(files, cv_data);

        _fix_filetypes(files, cv_data);

        console.log(cv_data);

    }

}