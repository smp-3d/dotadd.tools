export class ParseError {

    constructor(filename: string, message: string){
        this.file = filename;
        this.message = message;
    }

    message: string;
    file: string;
}

export class ExportError {

    constructor(filename: string, message: string){
        this.file = filename;
        this.message = message;
    }

    message: string;
    file: string;
}