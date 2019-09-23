var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _static_implements, ContainerType } from './ADCFormat';
import { ADD, Matrix } from 'dotadd.js';
let IEMFormat = class IEMFormat {
    static shortName() {
        return "iem";
    }
    static getName() {
        return "IEM AllRad Decoder Configuration Files";
    }
    static getDescription() {
        return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
    }
    static container_type() {
        return ContainerType.JSON;
    }
    static test(obj) {
        return obj.hasOwnProperty('Name')
            && obj.hasOwnProperty("Description")
            && obj.hasOwnProperty("Decoder")
            && obj.Decoder.hasOwnProperty("Weights");
    }
    static parse(obj, filename, carry) {
        let add = new ADD({
            name: obj.Name,
            description: obj.Description,
            author: "IEM Graz",
        });
        let date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();
        let ampm = date_str.slice(-2);
        let date = new Date(date_str.slice(0, -2));
        date.setHours(date.getHours() + ((ampm == 'pm') ? 12 : 0));
        add.setDate(date);
        let norm = obj.Decoder.ExpectedInputNormalization;
        add.addMatrix(new Matrix(0, norm, obj.Decoder.Matrix));
        add.repair();
        if (add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }
    static fromADD(add) {
        return "";
    }
};
IEMFormat = __decorate([
    _static_implements()
], IEMFormat);
export default IEMFormat;
