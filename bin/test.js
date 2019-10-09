const { Converter } = require('../cjs/NewConverter');
const { ConverterFile, ConverterOptions } = require('../cjs/ConverterHelpers')
const fs = require('fs');


module.exports = function (file, options) {

    let str = fs.realpathSync(file);

    let f = ConverterFile.fromPath(str);

    f.data = fs.readFileSync(str).toString();

    Converter.convert([f]);

}