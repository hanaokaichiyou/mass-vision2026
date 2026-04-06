import { Narve } from "narve"

export namespace MoonFlagMacroSigns {
    export class Pamph_FrontWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(count: number, cpcell: number){
            super("canvas",{class: "pamph_move"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "50px sans-serif"
            ctx.fillText(`${count}`,...center)
            if(cpcell !== 3){
                ctx.font = "30px sans-serif"
                ctx.fillText(`1マス${cpcell}`,center[0],170)
            }
    
        }
    }
    export class Pamph_BackWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(count: number, cpcell: number){
            super("canvas",{class: "pamph_move"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "50px sans-serif"
            ctx.fillText(`${count}`,...center)
            if(cpcell !== 3){
                ctx.font = "30px sans-serif"
                ctx.fillText(`(後ろ)1マス${cpcell}`,center[0],170)
            }else{
                ctx.font = "30px sans-serif"
                ctx.fillText(`(後ろ)`,center[0],170)
            }
    
        }
    }
    export class Pamph_Break_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(count: number,text: string){
            super("canvas",{class: "pamph_break"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.strokeRect(10,10,140,140)
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "50px sans-serif"
            ctx.fillText(`${count}`,...center)
            ctx.font = "30px sans-serif"
            ctx.fillText(text,center[0],170)
        }
    }
    export class Pamph_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(angle: number){
            super("canvas",{class: "pamph_spin"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.arc(...center,40,0,2*Math.PI)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(...center,70,0,2*Math.PI)
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "30px sans-serif"
            let spinto = angle>=0? "左" : "右"
            angle = Math.abs(angle)
            if(angle === 180){
                spinto = ""
            }
            ctx.fillText(`${spinto}${angle}°`,center[0],170)        
        }
    }
    
    // スライドによる方転とスライドの記号をセットにしたもの
    export class Pamph_Slide_Set_Cnvs extends Narve.Component{
        constructor(count: number){
            super("div",{},
                new Pamph_Force_Rotate_Cnvs(),
                new Pamph_Slide_Cnvs(count)
            )
        }
    }
    // スライド・初期方向設定による強制的な方転を示す記号
    export class Pamph_Force_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(){
            super("canvas",{class: "pamph_spin"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.arc(...center,40,0,2*Math.PI)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(...center,70,0,2*Math.PI)
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "30px sans-serif"
            ctx.fillText("次方向",center[0],170)        
        }
    }
    export class Pamph_Slide_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(count: number){
            super("canvas",{class: "pamph_slide"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
    
            const edgeLen = 140
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.moveTo(center[0],10)
            ctx.lineTo(center[0]-edgeLen/2,10 + edgeLen * Math.sqrt(3)/2)
            ctx.lineTo(center[0]+edgeLen/2,10 + edgeLen * Math.sqrt(3)/2)
            ctx.closePath()
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = `50px sans-serif`
            ctx.fillText(`${count}`,center[0],10 + edgeLen * Math.sqrt(3)/3)
        }
    }
    export class Pamph_Sit_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(count: number){
            super("canvas",{class: "pamph_slide"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
    
            const edgeLen = 140
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.moveTo(center[0],10)
            ctx.lineTo(center[0]-edgeLen/2,10 + edgeLen * Math.sqrt(3)/2)
            ctx.lineTo(center[0]+edgeLen/2,10 + edgeLen * Math.sqrt(3)/2)
            ctx.closePath()
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = `50px sans-serif`
            ctx.fillText(`${count}`,center[0],10 + edgeLen * Math.sqrt(3)/3)
            ctx.font = `30px sans-serif`
            ctx.fillText("座り",center[0],170)
        }
    }
    export class Pamph_Stand_Cnvs extends Narve.Component<HTMLCanvasElement> {
        constructor(count: number){
            super("canvas",{class: "pamph_slide"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            this.elem.width = 160
            this.elem.height = 200
    
            const edgeLen = 140
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.moveTo(center[0],10)
            ctx.lineTo(center[0]-edgeLen/2,10 + edgeLen * Math.sqrt(3)/2)
            ctx.lineTo(center[0]+edgeLen/2,10 + edgeLen * Math.sqrt(3)/2)
            ctx.closePath()
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = `50px sans-serif`
            ctx.fillText(`${count}`,center[0],10 + edgeLen * Math.sqrt(3)/3)
            ctx.font = `30px sans-serif`
            ctx.fillText("立ち",center[0],170)
        }
    }
}