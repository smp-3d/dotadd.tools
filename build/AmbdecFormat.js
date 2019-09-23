var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _static_implements, ContainerType } from './ADCFormat';
let AmbdecFormat = class AmbdecFormat {
    static shortName() {
        return "ambdec";
    }
    static getName() {
        return "Ambdec Files";
    }
    static getDescription() {
        return "Ambdec Files";
    }
    static container_type() {
        return ContainerType.CSV;
    }
    static test(obj) {
        return true;
    }
    static parse(obj, filename, carry, opts) {
    }
    static fromADD(add) {
        return "";
    }
};
AmbdecFormat = __decorate([
    _static_implements()
], AmbdecFormat);
export default AmbdecFormat;
