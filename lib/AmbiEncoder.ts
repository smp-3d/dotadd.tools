import { AmbiUtils } from "./Util";
import sht from "spherical-harmonic-transform";

export default class AmbiEncoder {

    m_order: number;

    m_azm: number = 0;
    m_elv: number = 0;

    m_coefs: number[][];
    m_channels: number = 1;

    constructor(order: number, channels: number){

        if(channels < 1)
            throw new Error("Cannot construct Encoder with less than 1 channel");

        this.m_order = order;
        this.m_channels = channels;

        this.m_coefs = new Array(AmbiUtils.channelCountForOrder(this.m_order)).fill(0);

    }

    applyGains(channels: number[][]){

        if(channels.length != this.m_channels)
            throw new Error("Unexpected channel count");

        if(channels[0].length != this.m_coefs[0].length)
            throw new Error("Unexpected input length");

        for(let ch = 0; ch < this.m_channels; ++ch){
            for(let co = 0; co < this.m_coefs[0].length; ++co)
                channels[ch][co] = this.m_coefs[ch][co] * channels[ch][co];
        }   

    }

    setCoords(coords: number[][]){

        let output = sht.computeRealSH(this.m_order, coords);

        this.m_coefs = output;

    }

    setManyCoords(coords: number[]){

    }

}