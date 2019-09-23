var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ContainerType, _static_implements } from "./ADCFormat";
import { ADD } from 'dotadd.js';
let ADDFormat = class ADDFormat {
    static shortName() {
        return "add";
    }
    static getName() {
        return "Ambisonic Decoder Description";
    }
    static getDescription() {
        return "Universal file format to describe Ambisonic decoders";
    }
    static container_type() {
        return ContainerType.JSON;
    }
    static test(obj) {
        return obj.hasOwnProperty("name")
            && obj.hasOwnProperty("decoder")
            && obj.hasOwnProperty("revision");
    }
    static parse(obj, filename, carry, opts) {
        let add = new ADD(obj);
        if (add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }
    static fromADD(add) {
        return add.export().serialize();
    }
};
ADDFormat = __decorate([
    _static_implements()
], ADDFormat);
export default ADDFormat;
