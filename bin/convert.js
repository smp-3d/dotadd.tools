const wrap_options = require('./wrap_options');
const { Converter, ConvertableTextFile, ParseResults } = require('../cjs/Converter');
const { ParseError } = require('../cjs/Util');
const fs = require('fs');
const c = require('chalk');
const columnify = require('columnify');

const { ADD } = require('dotadd.js');

const { Logger } = require('../cjs/Logger');

module.exports = function(files, options){

    if(options.parent.V)
        Logger.prototype.verbose = true;
    

    let results = new ParseResults();

    let coptions = wrap_options(options,
         'nojoin', 
         'norm', 
         'output', 
         'format', 
         'author', 
         'name',
         'description',
         'version',
         'guessOutputs', 
         'reNorm',
         'prettify',
         'outDir');

    try {

        results = Converter.convert_string(
                    files.map(f => new ConvertableTextFile(f, fs.readFileSync(f).toString())), 
                                coptions);

    } catch(e) {

        if(e instanceof ParseError){
            
            console.log();

            if(options.parent.V)
                console.log(e)
            else
                console.log(c.red('Error ') + `when parsing '${e.file}':  ${e.message}`);

            process.exit(1);

        } else exit_error(e, options.parent.V);
        
    }

    outputFile(results, coptions);

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

function outputFile(results, options){

    let output = options.use('output');
    let output_dir = options.use('outDir');

    if(results.output_files.length < 1){

        console.log();
        console.log("❌ Could not produce any output files");

        process.exit(1);
    }

    results.output_files.forEach((res, i) => {

        let output_file = '';

        if(output)
            output_file = output;
        else
            output_file = `${res.name}_${res.format}.${res.container}`;

        let ftype = output_file.slice((output_file.lastIndexOf(".") - 1 >>> 0) + 2);
        let file = output_file.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.');

        if(results.output_files.length > 1)
            file = file + '_' + i;

        output_file = file + '.' + ftype;

        output_file = applyInterpolation(output_file, res.add, i);

        if(output_dir)
            output_file = output_dir + "/" + output_file;

        console.log("Writing file: " + output_file);

        fs.writeFileSync(output_file, res.data);
    })

}

function exit_error(err, v){

    console.log();

    if(v)
        console.log(err)
    else
        console.log(c.red("Program Error: ") + err.message);

    process.exit(1);
}

function applyInterpolation(filename, add, index){

    filename = filename.replace("{norm}", add.decoder.matrices[0].normalization);
    filename = filename.replace("{author}", add.author);
    filename = filename.replace("{version}", add.version);
    filename = filename.replace("{name}", add.name);
    filename = filename.replace("{i}", index);
    filename = filename.replace("{order}", add.decoder.matrices[0].ambisonicOrder());
    filename = filename.replace("{spks}", add.decoder.output.channels.length);

    return filename;

}