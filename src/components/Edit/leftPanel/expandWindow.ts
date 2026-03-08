import { Narve } from "narve";
import { massCanvasDef } from "../../../global/massCanvasDef";
import Point from "../../../global/Point";

export default class ExpandWindow extends Narve.Component<HTMLCanvasElement> {
    cellSize = 20
    Width = (massCanvasDef.quarity+2) * this.cellSize
    Height = (massCanvasDef.quarity+2) * this.cellSize
    ctx: CanvasRenderingContext2D|null = null

    constructor(){
        super("canvas",{class: "expandWindow"})

        this.ctx = this.elem.getContext("2d")
        this.elem.width = this.Width
        this.elem.height = this.Height
        this.drawGrid()
    }
    plotCursor(point: Point){
        if(this.ctx === null) return
        const x = (point.x % massCanvasDef.quarity + 1)*this.cellSize
        const y = (point.y % massCanvasDef.quarity + 1)*this.cellSize
        this.ctx.fillStyle = "#f00"
        this.ctx.beginPath()
        this.clearAll()
        this.drawGrid()
        this.ctx.moveTo(x,y)
        this.ctx.arc(x,y,this.cellSize/2,0,2*Math.PI)
        this.ctx.fill()
    }
    drawGrid(){
        if(this.ctx === null) return
        // 基本グリッド
        this.ctx.lineWidth = 2
                this.ctx.strokeStyle = massCanvasDef.centerGridColor
        // 横線
        for(let r = 1;r <= massCanvasDef.quarity+1;r++){
        this.ctx.beginPath()
            if(r%24 == 1) this.ctx.setLineDash([1,0])
            else if((r % 8) == 1) this.ctx.setLineDash([10,5])
            else if(r%12 == 1) this.ctx.setLineDash([3,10])
            else continue
            this.ctx.moveTo(this.cellSize,this.cellSize*r)
            this.ctx.lineTo(this.Width-this.cellSize,this.cellSize*r)
            this.ctx.stroke()
        }
        // 縦線
        for(let c = 1;c <= massCanvasDef.quarity+1;c++){
            
            this.ctx.beginPath()
            if(c%24 == 1) this.ctx.setLineDash([1,0])
            else if((c % 8) == 1) this.ctx.setLineDash([10,5])
            else if(c%12 == 1) this.ctx.setLineDash([3,10])
            else continue
            this.ctx.moveTo(this.cellSize*c,this.cellSize)
            this.ctx.lineTo(this.cellSize*c,this.Height-this.cellSize)
            this.ctx.stroke()
        }
        // this.ctx.stroke()
    }
    clearAll(){
        if(this.ctx === null) return
        this.ctx.clearRect(0,0,this.Width,this.Height)
    }
}