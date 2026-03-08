import { Narve } from "narve";
import { massCanvasDef } from "../../global/massCanvasDef";
import { countState } from "../../global/count";

export default class MassCanvas extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null
    quarity:number = 0 // 1マスあたりのピクセル数
    Width: number = 0
    Height: number = 0

    constructor(){
        super("canvas")
        
        this.ctx = this.elem.getContext("2d")
        this.quarity = massCanvasDef.quarity
        this.Width = this.quarity*((massCanvasDef.gridColsNum-1)*3 + 2)
        this.Height = this.quarity*((massCanvasDef.gridRowsNum-1)*3 + 2)
        
        this.elem.width = this.Width
        this.elem.height = this.Height
    }
    clearAll(){
        this.ctx?.clearRect(0,0,this.Width,this.Height)
    }
    // getPersons(): Person[]{
    //     // I'll define this func in parent component (edit)
    //     return []
    // }
    getCurCountState(): countState{
        // in edit
        return {count: -1,sceneIndex: -1}
    }
}