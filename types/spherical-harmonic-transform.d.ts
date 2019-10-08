declare namespace default_export {
    
    function computeRealSH(order: number, azm_elv: number[][]) : number[][]

}


declare module 'spherical-harmonic-transform' {

    export default default_export;

}