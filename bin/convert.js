const wrap_options = require('./wrap_options');
const {Converter, ConvertableTextFile} = require('../cjs/Converter');
const fs = require('fs');
const c = require('chalk');
const columnify = require('columnify');

module.exports = function(files, options){

    let coptions = wrap_options(options, 'nojoin', 'norm', 'output');

    try {

        let results = Converter.convert_string(
                    files.map(f => new ConvertableTextFile(f, fs.readFileSync(f).toString())), 
                                coptions);

    } catch(e) {
        console.log(e);
    }

    let unused_coptions = coptions.getUnused();

    if(unused_coptions.length > 0){

        console.log();
        console.log(`${c.yellow("Warning: ")}The following options were not used by the converter: `);
        console.log();

        console.log(
            columnify(
                unused_coptions.map(opt => { 
                    return { padding: '     ', option: c.cyan(opt.name) + ':', value: opt.value } }), 
                { columnSplitter: '    ', showHeaders: false }
            )
        );
    }

}