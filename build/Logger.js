export class Logger {
    static log(...any) {
        let self = Logger;
        if (self.prototype.verbose)
            console.log(...any);
    }
}
