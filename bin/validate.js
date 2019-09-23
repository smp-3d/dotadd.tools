const fs = require('fs');
const { ADD } = require('dotadd.js');


module.exports = function (file, options) {
    
    let add_str = fs.readFileSync(file);

    try {
        
        let json = JSON.parse(add_str);

        let add = new ADD(json);

        if(!add.valid()){

            console.log("❌ ADD invalid: ");

            add.inv_reasons.forEach(reason => console.log("    " + reason));

        } else console.log("✅ Everything looks good.");

    } catch (e) {
        console.log("❌ Could not parse file: " + e.message);
    }
    
}