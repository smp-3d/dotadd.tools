var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _static_implements, ContainerType } from './ADCFormat';
let IEMFormat = class IEMFormat {
    static getName() {
        return "Ambidecode XML Configuration Files";
    }
    static getDescription() {
        return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
    }
    static container_type() {
        return ContainerType.JSON;
    }
    static test(obj) {
        return false;
    }
    static parse(obj, filename, carry) {
        throw new Error("Method not implemented.");
    }
};
IEMFormat = __decorate([
    _static_implements()
], IEMFormat);
export default IEMFormat;
