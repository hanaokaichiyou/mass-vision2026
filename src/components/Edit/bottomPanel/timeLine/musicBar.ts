import { Narve } from "narve";

export default class MassBar extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null = null
    constructor(){
        super("canvas",{class: "musicBar"})
        this.ctx = this.elem.getContext("2d")
        this.renderBar()
    }
    renderBar(){
        if(this.ctx === null) return

    }
    drawSupportLine(){
        
    }
}