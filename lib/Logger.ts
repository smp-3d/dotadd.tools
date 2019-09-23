export class Logger {

    static log(...any: any): void {

        let self = <any> Logger;

        if(self.prototype.verbose)
            console.log(...any);
    }
}