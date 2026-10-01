export type UndoFunc = {
    do: () => any
    undo: () => any
}
// MEMO シーンインデックスも保存してシーンに飛ぶようにする？
export default class Undo {
    protected stack: UndoFunc[] = []
    protected curIndex = 0
    constructor(){

    }
    push(...func: UndoFunc[]){
        this.stack.length = this.curIndex+1
        this.stack.push(...func)
        this.curIndex += func.length
    }
    undo(): boolean{
        if(this.stack[this.curIndex] !== undefined){
            this.stack[this.curIndex].undo()
            this.curIndex--
            return true
        }else{
            return false
        }
    }
    redo():boolean{
        if(this.stack[this.curIndex+1] !== undefined){
            this.curIndex++
            this.stack[this.curIndex].do()
            return true
        }else{
            return false
        }
    }
}