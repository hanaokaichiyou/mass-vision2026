// 今回は2x2だけ扱う
export function solveSimulEq(coefficients: [[number,number,number],[number,number,number]]): [number,number]|undefined{
    /*
        sa1 + tb1 = p
        sa2 + tb2 = q
        を解く
    */
    const c = coefficients
    const [[a1,b1,p],[a2,b2,q]] = c 
    let s: number|undefined
    if(b1 === 0){
        if(a1 === 0) return undefined
        s = p / a1
    }else if(b2 === 0){
        if(a2 === 0) return undefined
        s = q / a2
    }else{
        const div = a2*b1 - a1*b2
        if(div === 0) return undefined // 0割り回避(この時、二つの式は同値となる)
        s = (b1*q - b2*p) / div
    }

    let t: number|undefined
    if(b1 === 0){
        if(b2 === 0) return undefined
        t = (q - s * a2) / b2
    }else{
        t = (p - s * a1) / b1
    }
    return [s,t]
}