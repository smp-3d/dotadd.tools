export class ParseError {
    constructor(filename, message) {
        this.file = filename;
        this.message = message;
    }
}
export class ExportError {
    constructor(filename, message) {
        this.file = filename;
        this.message = message;
    }
}
