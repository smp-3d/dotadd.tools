import { ADD, Matrix } from 'dotadd.js';
import './AmbiEncoder'
import AmbiEncoder from './AmbiEncoder';



export default {

    estimateDirections(add: ADD){

        let out_dirs: number[][] = [];
        let directions: number[][] = [];

        let cs = [];
    
        for(let elv = -90; elv < 90; elv += 1)
            cs.push(elv)
        
    
        for(let azm = 0; azm < 360; azm += 1){
            
            let azm_arr = Array.from(cs);
    
            directions.push(...azm_arr.map(elv => [ azm, elv ]));
        
        }

        let enc = new AmbiEncoder(add.decoder.matrices[0].ambisonicOrder(), directions.length);

        let radf = Math.PI / 180;

        let rad_dirs = directions.map(dir => [ dir[0] * radf, dir[1] * radf ]);

        enc.setCoords(rad_dirs);

        add.decoder.matrices[0].renormalizeTo('n3d');

        add.decoder.matrices.forEach(mat => {

            mat.matrix.forEach(dec_dir => {

                let sums: number[] = [];

                directions.forEach((dir, di) => {

                    let sum = 0;

                    for(let ci = 0; ci < dec_dir.length; ++ci)
                        sum += dec_dir[ci] * enc.m_coefs[ci][di];

                    sums.push(sum);

                });

                let max_i = sums.indexOf(Math.max(...sums));

                console.log(directions[max_i]);

                out_dirs.push(directions[max_i]);

            });

        });

        if(add.decoder.output.channels.length == add.totalMatrixOutputs()){




        } else {

        }
    }
}