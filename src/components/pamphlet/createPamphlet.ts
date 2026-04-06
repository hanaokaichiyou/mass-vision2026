import { Narve, nr } from "narve";

import "./style/pamphlet.css"
import Scene from "../../global/Scene";
import TmpCanvas from "./tmpCanvas";
import { createFirstFrame, createFrames } from "../../global/CreateFrames";
import { action } from "../../global/Macro";
import { MathExp } from "../../global/mathExp";
import simLastState from "../../global/simLastState";

export function createPamphlet(scenes: Scene[],colorFills: boolean[]){
    const personalPamphlets: Narve.Component[] = []
    scenes.forEach((scene,sceneIndex) => {
        const frame = createFirstFrame(scene)
        const _sceneFrames = createFrames(scenes,1,sceneIndex,sceneIndex)
        if(_sceneFrames === null) {console.error("sceneFrames - null");return}
        const sceneFrames = _sceneFrames[0]
        if(sceneFrames === undefined) return

        scene.persons.forEach((person) => {
            const tmpCanvas = new TmpCanvas()
            tmpCanvas.drawFrame(frame,sceneFrames,person,colorFills)
            const pamph = nr("div",{},
                nr("h1",{},`No.${person.id} シーン${sceneIndex+1}`),
                tmpCanvas
            )
            if(person.macroIndex === undefined) return
            const macro = scene.macros[person.macroIndex]
            if(macro === undefined) return

            
            let accCount = 0 // 最初・最後の方転かを判定するためのもの
            // 最後の方転か判断するときに使う↓
            const sumCount = macro.actions.reduce((pre,act) => 
                pre + act.count.evaluate(person.variables,true)
            ,0)

            const macroElems = macro.actions.map((action) => {
                const count = action.count.evaluate(person.variables,true)
                if(action.move.type !== "rotate" && count === 0) return null

                accCount += count
                switch(action.move.type){
                    case "break": return new Pamph_Break_Cnvs(count,action.move.text)
                    // TODO　「立ち」のパンフでの表示に困ってる
                    case "liner": return new Pamph_FrontWalk_Cnvs(count,Math.round(count / action.move.dcell.evaluate(person.variables)))
                    case "back": return new Pamph_BackWalk_Cnvs(count,Math.round(count / action.move.dcell.evaluate(person.variables)))
                    case "rotate": 
                        // MEMO シーンをまたいだ連続の方転は繋げれるけど、同シーン内で連続してたら正しく動作しない
                        const normalRet = new Pamph_Rotate_Cnvs(action.move.rotateAngle.evaluate(person.variables,true),count)
                        if(sceneIndex > 0 && accCount === 0){// 最初の方転は前シーンの方転に吸収されうる
                            const preLastAction = getLastAction(scenes[sceneIndex-1],person.id)
                            if(preLastAction && preLastAction.move.type === "rotate") return null
                        }
                        if(sceneIndex < scenes.length-1 && accCount === sumCount){ // 最後の方転は次シーンの最初の方転を吸収する可能性あり
                            const nextScenesMe = scenes[sceneIndex+1].persons.find(p => p.id = person.id)
                            const nextFirstAction = getFirstAction(scenes[sceneIndex+1],person.id)
                            if(nextScenesMe && nextFirstAction && nextFirstAction.move.type === "rotate"){
                                const rotateAngle = action.move.rotateAngle.evaluate(person.variables,true) + 
                                    nextFirstAction.move.rotateAngle.evaluate(nextScenesMe.variables,true)
                                return new Pamph_Rotate_Cnvs(rotateAngle,count)
                            }
                        }
                        // 普通のとき
                        return normalRet
                    case "revolve":
                    case "dyclon":
                    case "slide":
                        return new Pamph_Slide_Set_Cnvs(count)
                    case "sit": return new Pamph_Sit_Cnvs(count)
                    case "stand": return new Pamph_Stand_Cnvs(count)
                }
            }).filter(v => v !== null)

            
            // 初期方向設定による強制的な方転について
            if(sceneIndex < scenes.length-1){
                const nextScenesMe = scenes[sceneIndex+1].persons.find(p => p.id = person.id)
                if(nextScenesMe){
                    const firstActType = getFirstAction(scenes[sceneIndex+1],nextScenesMe.id)?.move.type 
                    if(
                        firstActType && 
                        firstActType !== "slide" && 
                        firstActType !== "rotate" &&
                        firstActType !== "dyclon" &&
                        firstActType !== "revolve"
                    ){ // 次シーンの最初にスライド・方転が入ると初期方向設定による強制的な方転が無視される
                        const curLastRotateAngle = simLastState(person, scene).rotateAngle
                        if(curLastRotateAngle !== nextScenesMe.startState.rotateAngle){
                            macroElems.push(new Pamph_Force_Rotate_Cnvs())
                        }
                    }
                }
            }
            pamph.children.push(nr("div",{class: "pamphMacroArea"},...macroElems))
            pamph.children.push(nr("div",{class: "page-break"}))
            if(personalPamphlets[person.id-1] === undefined){
                personalPamphlets[person.id-1] = nr()
            }
            personalPamphlets[person.id-1].children.push(pamph)
        })
    })

    const undFilteredPP = personalPamphlets.filter(v => v !== undefined)
    const ret = nr("div",{class: "pamphlet"},...undFilteredPP)
        console.log("personalPamphlets",undFilteredPP)
    // ret.children.push(...personalPamphlets)
    console.log("ret",ret)
    return ret
}
function getFirstAction(scene: Scene,id: number){
    const person = scene.persons.find(v => v.id === id)
    if(person === undefined) return
    if(person.macroIndex === undefined) return
    const macro = scene.macros[person.macroIndex]
    if(macro === undefined) return
    let firstAction: action = {
        move: {
            type: "break",
            text: ""
        },
        count: new MathExp.ExpressionTree("0")
    }
    macro.actions.some(action => {
        if(action.move.type === "rotate"){
            firstAction = action
            return true
        }
        if(action.count.evaluate(person.variables) > 0){
            firstAction = action
            return true
        }
        return false
    })
    return firstAction
}
function getLastAction(scene: Scene,id: number){
    const person = scene.persons.find(v => v.id === id)
    if(person === undefined) return
    if(person.macroIndex === undefined) return
    const macro = scene.macros[person.macroIndex]
    if(macro === undefined) return
    let firstAction: action = {
        move: {
            type: "break",
            text: ""
        },
        count: new MathExp.ExpressionTree("0")
    }
    ;[...macro.actions].reverse().some(action => {
        if(action.move.type === "rotate"){
            firstAction = action
            return true
        }
        if(action.count.evaluate(person.variables) > 0){
            firstAction = action
            return true
        }
        return false
    })
    return firstAction
}

class Pamph_FrontWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
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
class Pamph_BackWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
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
class Pamph_Break_Cnvs extends Narve.Component<HTMLCanvasElement> {
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
class Pamph_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
    constructor(angle: number,count: number){
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
        // カウント一応書いとく
        ctx.fillText(`${count}`,...center)
    }
}

// スライドによる方転とスライドの記号をセットにしたもの
class Pamph_Slide_Set_Cnvs extends Narve.Component{
    constructor(count: number){
        super("div",{},
            new Pamph_Force_Rotate_Cnvs(),
            new Pamph_Slide_Cnvs(count)
        )
    }
}
// スライド・初期方向設定による強制的な方転を示す記号
class Pamph_Force_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
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
class Pamph_Slide_Cnvs extends Narve.Component<HTMLCanvasElement> {
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
class Pamph_Sit_Cnvs extends Narve.Component<HTMLCanvasElement> {
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
class Pamph_Stand_Cnvs extends Narve.Component<HTMLCanvasElement> {
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