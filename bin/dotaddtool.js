#! /usr/bin/env node

const { Converter, ConverterOptions } = require('../cjs/Converter');
const program = require('commander');


program.version(require('../package.json').version);

program.name('dotaddtool');

program.command('convert <files...>')
        .option('-o, --output <file>', 'output file')
        .option('--nojoin', 'do not join any files together')
        .option('--norm <normalisation>', 'specify normalisation')
        .action(require('./convert'));

program.parse(process.argv);