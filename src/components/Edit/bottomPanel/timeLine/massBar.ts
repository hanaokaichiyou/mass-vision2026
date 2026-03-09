import { Narve } from "narve";
import { timeLineDef } from "./timeLineDef";

export default class MassBar extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null = null
    Width: number = 0
    Height: number = 0

    count = 0
    constructor(){
        super("canvas",{class: "massBar"})
        this.ctx = this.elem.getContext("2d")
    }
    startScene(count: number){
        this.setCountAndResize(count)
        this.renderBar()
    }
    setCountAndResize(count: number){
        this.count = count

        this.Width = this.count * timeLineDef.countLineGapPx + 1
        this.Height = timeLineDef.massBarHeightPx
        
        this.elem.width = this.Width
        this.elem.height = this.Height
    }
    renderBar(){
        if(this.ctx === null) return

        this.ctx.fillStyle = "#88f"
        this.ctx.beginPath()
        this.ctx.fillRect(0,0,this.count * timeLineDef.countLineGapPx + 1,timeLineDef.massBarHeightPx)
        this.ctx.strokeStyle = "#fff"
        for(let i = 0; i <= this.count; i++){
            this.ctx.beginPath()
            const x = i*timeLineDef.countLineGapPx
            this.ctx.moveTo(x,0)
            let y = timeLineDef.normalLineLen
            if(i % timeLineDef.longLineGapCount === 0){
                y = timeLineDef.longLineLen
            }else if(i % timeLineDef.midiumLineGapCount === 0){
                y = timeLineDef.midiumLineLen
            }
            this.ctx.lineTo(x,y)
            this.ctx.stroke()
        }
    }
}