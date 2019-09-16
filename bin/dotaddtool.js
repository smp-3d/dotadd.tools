#! /usr/bin/env node

const { Converter, ConverterOptions } = require('../cjs/Converter');
const program = require('commander');


program.version(require('../package.json').version);

program.parse(process.argv);