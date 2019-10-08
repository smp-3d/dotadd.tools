import { ADD, Matrix } from 'dotadd.js';
import './AmbiEncoder'
import AmbiEncoder from './AmbiEncoder';
import c from 'chalk';



export default {

    estimateDirections(input_add: ADD, accurracy: number = 0.3){

        let add = new ADD(input_add.export());

        let out_dirs: number[][] = [];

        let dirs = _make_directions(accurracy, accurracy);

        let deg = add.decoder.matrices[0].ambisonicOrder();

        process.stdout.write(`Generating real SH sets of degree ${
            c.cyan(""+deg)} for ${
            c.cyan(""+dirs.length)} directions... `);

        let enc = new AmbiEncoder(deg, dirs.length);

        let radf = Math.PI / 180;

        let rad_dirs = dirs.map(dir => [ dir[0] * radf, dir[1] * radf ]);

        enc.setCoords(rad_dirs);

        console.log(c.green("done"));

        add.decoder.matrices.forEach((mat, m_i) => {

            mat.renormalizeTo('n3d');

            mat.matrix.forEach((dec_dir, d_i) => {

                process.stdout.write(
                    `Rendering virtual sphere for matrix ${c.cyan(''+m_i)} channel ${c.cyan(''+d_i)}...`);

                let sums: number[] = [];

                dirs.forEach((dir, di) => {

                    let sum = 0;

                    for(let ci = 0; ci < dec_dir.length; ++ci)
                        sum += dec_dir[ci] * enc.m_coefs[ci][di];

                    sums.push(sum);

                });

                let max_i = _max_i(sums);

                out_dirs.push(dirs[max_i]);

                let azm = _round(dirs[max_i][0]);
                let elv = _round(dirs[max_i][1]);

                console.log(` ${c.green("done")} azm: ${c.cyan(""+azm)} elv: ${c.cyan(""+elv)}`);

            });

        });

    }
}

function _make_directions(azm_acc: number, elv_acc: number){

    let cs = [];

    let directions: number[][] = [];

    for(let elv = -90; elv < 90; elv += elv_acc)
        cs.push(elv)


    for(let azm = 0; azm < 360; azm += azm_acc){
        
        let azm_arr = Array.from(cs);

        directions.push(...azm_arr.map(elv => [ azm, elv ]));

    }

    return directions;

}

function _round(n : number): number {
    return Math.round(n * 1000) / 1000
}

function _max_i( arr: number[] ): number {

    let max: number = 0;
    let max_i: number = 0;

    arr.forEach((s, i) => {
        if(s > max){
            max_i = i;
            max = s;
        }
    });

    return max_i;

}