const fs = require('fs');
const c = require('chalk');
const { ADD } = require('dotadd.js');
const estimateDirections = require('../cjs/DirectionEstimator').default.estimateDirections;

module.exports = function (file, options) {

    let f = {};

    try {
        f = JSON.parse(fs.readFileSync(file).toString());
    } catch (e) {
        console.log(c.red("Could not repair:") + e.message);
        return;
    }

    let add = new ADD(f);

    estimateDirections(add);


    if (add.valid())
        return console.log("Could not identify any problems");

    add.repair();

    if (add.valid()) {
        fs.writeFileSync(file, add.export().serialize())
        return console.log("✅ ADD repaired.");
    }
    else
        return console.log("❌ Could not repair ADD");

}