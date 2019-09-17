#! /usr/bin/env node

const { Converter, ConverterOptions } = require('../cjs/Converter');
const program = require('commander');


program.version(require('../package.json').version);

program.name('dotaddtool');

program.command('convert <files...>')
        .description('convert between different ambisonic decoder description formats')
        .option('-o, --output <file>', 'output file')
        .option('-f, --format <format>', 'output format (default: add)')
        .option('--nojoin', 'do not join any files together')
        .option('--norm <normalisation>', 'specify normalisation')
        .option('--re-norm <normalisation>', 'change normalisation')
        .action(require('./convert'));

program.command('info <files...>')
        .description('display info about ambisonic decoder descriptions')

program.command('repair <file>')
        .description('repair .add files')

program.parse(process.argv);