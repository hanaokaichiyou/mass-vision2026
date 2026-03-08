export function Ra(n: number){
    return {
        [Symbol.iterator]: () => {
            let i = 0
            return {
                next: () => {
                    return { value: i++, done: i<n }
                }
            }
        }
    }
}
export class R{
    n: number
    constructor(n: number){
        this.n = n
    }
    [Symbol.iterator] = () => {
        let i = 0
        return {
            next: () => {
                return i < this.n
                ? { value: i++, done: false }
                : { value: undefined, done: true}
            }
        }
    }
}