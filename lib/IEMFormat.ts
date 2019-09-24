import { _static_implements, ADCFormat, ContainerType } from './ADCFormat'
import { ParseResults } from './Converter'
import { ADD, Matrix, OutputChannel, AEDCoord } from 'dotadd.js'


@_static_implements<ADCFormat>()
export default class IEMFormat {

    static shortName(): string {
        return "iem";
    }

    static getName(): string {
        return "IEM AllRad Decoder Configuration Files"
    }  
      
    static getDescription(): string {
        return "Exported and imported by the IEM Allrad decoder. Can also be read by the IEM Simple Decoder";
    }

    static container_type(): ContainerType {
        return ContainerType.JSON;
    }

    static test(obj: any): Boolean {
        return obj.hasOwnProperty('Name') 
                && obj.hasOwnProperty("Description") 
                && obj.hasOwnProperty("Decoder")
                && obj.Decoder.hasOwnProperty("Weights");
    }
   
    static parse(obj: any, filename: string, carry: ParseResults) {

        let add = new ADD({
            name: obj.Name,
            description: obj.Description,
            author: "IEM Graz",
        });

        let date_str = obj.Description.split(".")[obj.Description.split(".").length - 1].trim();

        let ampm = date_str.slice(-2);

        let date = new Date(date_str.slice(0, -2));

        date.setHours(date.getHours() + ((ampm == 'pm')? 12 : 0));

        add.setDate(date);

        add.addMatrix(new Matrix(0, obj.Decoder.ExpectedInputNormalization, obj.Decoder.Matrix));

        let num_outputs = obj.LoudspeakerLayout.Loudspeakers
            .reduce((val: number, spk: any) => val + +!spk.IsImaginary, 0);

        let num_imags = obj.LoudspeakerLayout.Loudspeakers
            .reduce((val: number, spk: any) => val + spk.IsImaginary, 0);

        add.decoder.output.matrix = [];

        for(let i = 0; i < obj.LoudspeakerLayout.Loudspeakers.length; ++i)
            add.decoder.output.matrix.push(new Array(num_outputs).fill(0));

        obj.LoudspeakerLayout.Loudspeakers.forEach((speaker: any, index: number) => 
            add.addOutput(
                new OutputChannel(
                    `${obj.LoudspeakerLayout.Name} ${index}${(speaker.IsImaginary)?" [IMAG]":""}`,
                     'spk', 
                    {coords: new AEDCoord(
                        speaker.Azimuth,
                        speaker.Elevation,
                        speaker.Radius
                    )})));

    
        obj.Decoder.Routing.forEach((ch: number, index: number) => {
            add.decoder.output.matrix[ch - 1][index] 
                = obj.LoudspeakerLayout.Loudspeakers[ch - 1].Gain;
        });

        console.log(add.decoder.output);

        if(add.valid())
            carry.results.push(add);
        else
            carry.incomplete_results.push(add);
    }

    static fromADD(add: ADD): string{

        let iem = {
            Name: add.name,
            Description: add.description,
            Decoder: {
                Name: add.name,
                Description: add.description,
                ExpectedInputNormalization: add.decoder.matrices[0].getNormalisation(),
                Weights: "maxrE",
                WeightsAlreadyApplied: false,
                Matrix: <number[][]> [],
                Routing: <number[]> []
            },
            LoudspeakerLayout: {
                Name: "",
                Loudspeakers: <object[]> []
            }
        }

        add.decoder.output.channels.forEach((ch: OutputChannel, i: number) => {

            let spk = {
                Azimuth: ch.coords.a || 0,
                Elevation: ch.coords.e || 0,
                Radius: ch.coords.d || 1,
                IsImaginary: isImag(add, i),
                Channel: i + 1,
                Gain: gainForChannel(add, i)
            }

            if(!isImag(add, i))
                iem.Decoder.Routing.push(i+1);

            iem.LoudspeakerLayout.Loudspeakers.push(spk);
        });

        iem.Decoder.Matrix = add.decoder.matrices[0].matrix;

        return JSON.stringify(iem, null, 2);
    }

}

function isImag(add: ADD, index: number): boolean {
    return add.decoder.output.matrix[index]
        .reduce((val: number, arr: number) => val + arr, 0) == 0.;
}

function gainForChannel(add: ADD, index: number): number {
    return add.decoder.output.matrix[index]
        .reduce((val: number, arr: number) => val + arr, 0);
}       