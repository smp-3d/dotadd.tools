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

export const AmbiUtils = {

    channelCountForOrder(order: number): number {
        return Math.pow(order + 1, 2);
    },

    orderForChannelCount(channels: number): number {
        return Math.floor(Math.sqrt(channels));
    },

    ACN : {

        order(acn: number): number {
            return AmbiUtils.orderForChannelCount(acn);
        },

        index(acn: number): number {
            const order = AmbiUtils.ACN.order(acn);
            return acn - order * (order + 1);
        },

        acn(order: number, index: number){
            return Math.pow(order, 2) + order + index;
        }

    }
 
};