const { ConverterOptions, ConverterOption } = require('../cjs/Converter');

module.exports = function(options_obj,  ...names) {
    return new ConverterOptions(...(names.reduce((carry, name) => {
        if(options_obj[name] != null)
            carry.push(new ConverterOption(name, options_obj[name]));
        return carry;
    }, [])));
}
