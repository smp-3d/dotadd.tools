#! /usr/bin/env node

const { Converter, ConverterOptions } = require('../cjs/Converter');
const program = require('commander');


program.version(require('../package.json').version);

program.name('dotaddtool')
        .option('--verbose, -v');

program.command('convert <files...>')
        .description('convert between different ambisonic decoder description formats')
        .option('-o, --output <file>', 'output file')
        .option('-d, --description <description>', 'output file description')
        .option('-n, --name <name>', 'output file name')
        .option('-v, --version <version>', 'output file version')
        .option('-a, --author <author>', 'output file author')
        .option('-f, --format <format>', 'output format (default: add)')
        .option('-p, --prettify', 'prettify json based output formats')
        .option('--nojoin', 'do not join any files together')
        .option('--norm <normalisation>', 'specify normalisation')
        .option('--re-norm <normalisation>', 'change normalisation')
        .option('-go, --guess-outputs')
        .action(require('./convert'));

program.command('info <files...>')
        .description('display info about ambisonic decoder descriptions');

program.command('repair <file>')
        .description('repair .add files');

program.command('validate <file>')
        .description('validate .add files')
        .action(require('./validate'));

program.parse(process.argv);