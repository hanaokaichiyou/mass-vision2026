import { Narve } from "narve"

export namespace MoonFlagMacroSigns {
    export class Pamph_FrontWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
        // 正方形
        constructor(count: number, cpcell: number){
            super("canvas",{class: "pamph_move"})
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
            switch(cpcell){
                case 2:
                    ctx.fillText(`倍`,center[0],5)
                    break
                case 4:
                    ctx.fillText(`定`,center[0],5)
                    break
                default:
                    ctx.fillText(`1マス${cpcell}`,center[0],170)
                    break
            }
        }
    }
    export class Pamph_BackWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
        // 正方形
        constructor(count: number, cpcell: number){
            super("canvas",{class: "pamph_move"})
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
            switch(cpcell){
                case 2:
                    ctx.fillText(`(後ろ)倍`,center[0],5)
                    break
                case 4:
                    ctx.fillText(`(後ろ)定`,center[0],5)
                    break
                default:
                    ctx.fillText(`(後ろ)1マス${cpcell}`,center[0],170)
                    break
            }
        }
    }
    export class Pamph_Break_Cnvs extends Narve.Component<HTMLCanvasElement> {
        // 六角形
        constructor(count: number,text: string){
            super("canvas",{class: "pamph_break"})
            const ctx = this.elem.getContext("2d")
            if(ctx === null) return
    
            const center: [number,number] = [80,80]
            const edgeLen = 81
            const r = Math.sqrt(3) / 2 // √3/2
            this.elem.width = 160
            this.elem.height = 200
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 3
            ctx.moveTo(center[0],               center[1] - edgeLen)
            ctx.lineTo(center[0] - edgeLen * r, center[1] - edgeLen/2)
            ctx.lineTo(center[0] - edgeLen * r, center[1] + edgeLen/2)
            ctx.lineTo(center[0],               center[1] + edgeLen)
            ctx.lineTo(center[0] + edgeLen * r, center[1] + edgeLen/2)
            ctx.lineTo(center[0] + edgeLen * r, center[1] - edgeLen/2)
            ctx.closePath()
            ctx.stroke()
            
            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "50px sans-serif"
            ctx.fillText(`${count}`,...center)
            ctx.font = "30px sans-serif"
            ctx.fillText(text,center[0],170)
        }
    }
    export class Pamph_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
        // 正三角形
        constructor(relAngle: number|undefined,absAngle: number,count: number){
            super("canvas",{class: "pamph_spin"})
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
            ctx.fillText(`${count}`,...center)

            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "30px sans-serif"

            if(relAngle !== undefined){
                let spinto = relAngle>=0? "左" : "右"
                relAngle = Math.abs(relAngle)
                if(relAngle === 180){
                    // TODO 180°でも右左つける
                    spinto = ""
                }
                ctx.fillText(`${spinto}${relAngle}°`,center[0],170)        
            }

            // TODO y座標5で文字が見切れないかチェック
            ctx.fillText(`t${absAngle}`,center[0],5)     
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
        // 正三角形
        constructor(){
            super("canvas",{class: "pamph_spin"})
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
            ctx.fillText(`0`,...center)

            ctx.textBaseline = "middle"
            ctx.textAlign    = "center"
            ctx.font = "30px sans-serif"
            ctx.fillText(`スライド方向`,center[0],170)        
        }
    }
    export class Pamph_Slide_Cnvs extends Narve.Component<HTMLCanvasElement> {
        // 正方形
        constructor(count: number){
            super("canvas",{class: "pamph_slide"})
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
            ctx.fillText("スライド",center[0],5)
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