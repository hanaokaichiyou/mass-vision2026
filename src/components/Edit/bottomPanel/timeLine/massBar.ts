import { Narve } from "narve";
import { timeLineDef } from "./timeLineDef";
import TimeLine, { StartCounts } from "../timeLine";

export default class MassBar extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null = null
    Width: number = 0
    Height: number = 0

    count = 0

    grabStartCount: number|null = null
        
    parent: TimeLine    
    constructor(parent: TimeLine){
        super("canvas",{class: "massBar"})
        this.parent = parent

        this.ctx = this.elem.getContext("2d")
        this.setCountAndResize(0)
        
        this.setCountAndResize(0)
        this.elem.onmousedown = e => this.onMouseDown(e)
        this.elem.onmousemove = e => this.onMouseMove(e)
        this.elem.onmouseout = this.elem.onmouseup = e => this.onMouseUp(e)
    }
    reload(startCounts: StartCounts = this.parent.startCounts){
        this.setCountAndResize(this.count,startCounts.massStartCount)
        this.renderBar(startCounts.massStartCount)
    }
    loadScene(count: number){
        if(this.parent.isStartCountEditable){
            this.elem.classList.add("editable")
        }else{
            this.elem.classList.remove("editable")
        }
        this.setCountAndResize(count)
        this.renderBar()
    }
    setCountAndResize(count: number,massStartCount = this.parent.startCounts.massStartCount){
        this.count = count

        this.Width = (massStartCount + this.count) * timeLineDef.countLineGapPx + 1
        if(this.count === 0) this.Width = 0
        this.Height = timeLineDef.massBarHeightPx
        
        this.elem.width = this.Width
        this.elem.height = this.Height
    }
    renderBar(massStartCount = this.parent.startCounts.massStartCount){
        if(this.ctx === null) return

        const gap = timeLineDef.countLineGapPx
        this.ctx.fillStyle = timeLineDef.massBarBack
        this.ctx.beginPath()
        this.ctx.fillRect(massStartCount*gap,0,this.count * gap + 1,timeLineDef.massBarHeightPx)
        this.ctx.strokeStyle = "#fff"
        for(let i = 0; i <= this.count; i++){
            this.ctx.beginPath()
            const x = (massStartCount + i) * timeLineDef.countLineGapPx
            this.ctx.moveTo(x,0)
            let y = timeLineDef.normalLineLen
            if(i % timeLineDef.longLineGapCount === 0){
                y = timeLineDef.longLineLen
                this.ctx.textAlign = "right"
                this.ctx.textBaseline = "bottom"
                this.ctx.fillStyle ="#fff"
                this.ctx.font = "sans-serif 16px"
                this.ctx.fillText(`${i}`,x,timeLineDef.massBarHeightPx)
            }else if(i % timeLineDef.midiumLineGapCount === 0){
                y = timeLineDef.midiumLineLen
            }
            this.ctx.lineTo(x,y)
            this.ctx.stroke()
        }
    }
    onMouseDown(e: MouseEvent){
        if(!this.parent.isStartCountEditable) return
        const count = this.offsetToCount(e)
        this.grabStartCount = count
        this.elem.classList.add("editting")
    }
    onMouseMove(e: MouseEvent){
        if(this.grabStartCount === null) return
        const dCount = this.offsetToCount(e) - this.grabStartCount
        let newStartCount = this.parent.startCounts.massStartCount + dCount
        newStartCount = Math.max(0,newStartCount)
        this.onMassStartCountChanged(newStartCount)// ここでreloadされる
    }
    onMouseUp(e: MouseEvent){
        if(this.grabStartCount === null) return
        const dCount = this.offsetToCount(e) - this.grabStartCount
        this.parent.startCounts.massStartCount += dCount
        this.parent.startCounts.massStartCount = Math.max(0,this.parent.startCounts.massStartCount)
        // 音楽の再生開始位置が1シーンの最後のカウントより後にならないようにする
        this.parent.startCounts.musicStartCount = Math.min(
            this.parent.startCounts.massStartCount + this.count, 
            this.parent.startCounts.musicStartCount
        )
        this.grabStartCount = null
        this.elem.classList.remove("editting")
        this.onMassStartCountChanged(this.parent.startCounts.massStartCount)
        this.onMassStartCountUpdated(this.parent.startCounts.massStartCount)
        console.log("mass startCounts", this.parent.startCounts)
    }
    onMassStartCountChanged(massStartCount:number){massStartCount}
    onMassStartCountUpdated(massStartCount:number){massStartCount}
    // 小数OK
    protected offsetToCount(e: MouseEvent){
        const gap = timeLineDef.countLineGapPx
        const px = e.offsetX*(this.Width/this.elem.getBoundingClientRect().width)
        return px / gap
    }
}