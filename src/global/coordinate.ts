import { massCanvasDef } from "./massCanvasDef";
import Point from "./Point";

export function px2coordinates(pos: Point): [string,string]{
    return [
        int2coordinate(pos.sub(massCanvasDef.centerPx).x,massCanvasDef.quarity),
        int2coordinate(pos.sub(massCanvasDef.centerPx).y,massCanvasDef.quarity)
    ]
}
export function coordinates2pix(coordinate: Point){
    return new Point(
        coordinate2int(coordinate.x,massCanvasDef.quarity),
        coordinate2int(coordinate.y,massCanvasDef.quarity)
    ).add(massCanvasDef.centerPx)
}
function coordinate2int(x: number,base: number){
    let pow10 = 1
    while(base >= pow10) pow10 *= 10
    let sign = x>=0?1:-1

    x = Math.abs(x);
    let int = Math.floor(x)*base
    let x10 = x * pow10
    x10 -= Math.floor(x) * pow10
    x10 = Math.round(x10)
    int += x10
    return int * sign
}
function int2coordinate(int: number, base: number): string{
    let pow10 = 1;
    let keta = 0;
    while(base >= pow10){
        pow10 *= 10;
        keta++;
    }

    let isMinues = int<0

    int = Math.abs(int);
    let keta0str = Array(keta).fill("0").join("")
    const x = Math.floor(int/base); 
    const y = (keta0str + (int % base)).slice(-keta);
    return `${isMinues?"-":""}${x}.${y}`
}