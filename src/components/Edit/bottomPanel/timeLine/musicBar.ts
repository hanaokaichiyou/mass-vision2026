import { Narve } from "narve";
import { timeLineDef } from "./timeLineDef";
import TimeLine, { StartCounts } from "../timeLine";

export default class MusicBar extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null = null
    Width = 0
    Height = 0
    count = 0

    grabStartCount: number|null = null

    fileName: string|null = null
    parent: TimeLine
    constructor(parent: TimeLine){
        super("canvas",{class: "musicBar"})
        this.parent = parent

        this.ctx = this.elem.getContext("2d")
        this.setCountAndResize(0)
        this.elem.onmousedown = e => this.onMouseDown(e)
        this.elem.onmousemove = e => this.onMouseMove(e)
        this.elem.onmouseout = this.elem.onmouseup = e => this.onMouseUp(e)
    }
    setFileName(fileName: string){
        this.fileName = fileName
        this.renderBar()
    }
    reload(startCounts: StartCounts = this.parent.startCounts){
        this.setCountAndResize(this.count,startCounts.massStartCount)
        this.renderBar()
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
        this.Height = timeLineDef.musicBarHeightPx
        
        this.elem.width = this.Width
        this.elem.height = this.Height
    }
    renderBar(musicStartCount = this.parent.startCounts.musicStartCount){
        if(this.ctx === null) return

        const gap = timeLineDef.countLineGapPx
        this.ctx.fillStyle = timeLineDef.musicBarBack
        this.ctx.beginPath()
        this.ctx.clearRect(0,0,this.Width,this.Height)
        this.ctx.fillRect(musicStartCount * gap,0,this.Width,this.Height) // Widthを使うことで右限界まで塗れる
        if(this.fileName !== null){
            this.ctx.font = "12px sans-serif"
            this.ctx.textAlign = "left"
            this.ctx.textBaseline = "middle"
            this.ctx.fillStyle = "#fff"
            this.ctx.fillText(this.fileName,musicStartCount * gap,this.Height/2)
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
        let newStartCount = this.parent.startCounts.musicStartCount + dCount
        newStartCount = Math.max(0,newStartCount)
        newStartCount = Math.min(this.parent.startCounts.massStartCount + this.count,newStartCount)

        this.renderBar(newStartCount)
    }
    onMouseUp(e: MouseEvent){
        if(this.grabStartCount === null) return
        const dCount = this.offsetToCount(e) - this.grabStartCount
        this.parent.startCounts.musicStartCount += dCount
        this.parent.startCounts.musicStartCount = Math.max(0,this.parent.startCounts.musicStartCount)
        this.parent.startCounts.musicStartCount = Math.min(
            this.parent.startCounts.massStartCount + this.count,
            this.parent.startCounts.musicStartCount
        )

        this.grabStartCount = null
        this.elem.classList.remove("editting")
        this.renderBar()
        this.onMusicStartCountUpdated(this.parent.startCounts.musicStartCount)
    }
    onMusicStartCountUpdated(musicStartCount:number){musicStartCount}
    // 小数OK
    protected offsetToCount(e: MouseEvent){
        const gap = timeLineDef.countLineGapPx
        const px = e.offsetX*(this.Width/this.elem.getBoundingClientRect().width)
        return px / gap
    }
}