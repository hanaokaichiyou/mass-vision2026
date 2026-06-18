import { Narve, nr } from "narve";

import "./style/pamphlet.css"
import Scene from "../../global/Scene";
import TmpCanvas from "./tmpCanvas";
import { action } from "../../global/Macro";
import { MathExp } from "../../global/mathExp";
import simLastState from "../../global/simLastState";
import { createFramesFromAction } from "../../global/CreateFramesFromMacro";
import PointDiff from "../../global/PointDiff";
import Point from "../../global/Point";
import { massCanvasDef } from "../../global/massCanvasDef";

export function createPamphlet(scenes: Scene[],colorFills: boolean[],mode: PamphMode){
    const personalPamphlets: Narve.Component[] = []
    scenes.forEach((scene,sceneIndex) => {
        scene.persons.forEach((person) => {
            const tmpCanvas = new TmpCanvas()
            tmpCanvas.drawFrame(scene,person,colorFills)
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
            let nextState = person.startState.clone()
            console.log(`scene:${sceneIndex}`,macro.macroStr,`actions`, macro.actions)
            const macroElems = macro.actions.map((action) => {
                const curState = nextState.clone()
                const count = action.count.evaluate(person.variables,true)
                if(action.move.type !== "rotate" && action.move.type !== "absRotate" && count === 0) return null

                accCount += count
                const [_,newState] = createFramesFromAction(action,curState,0,scene.slides,person)
                nextState = newState
                switch(action.move.type){
                    case "break": return new Pamph_Break_Cnvs(count,action.move.text)
                    case "idle" : return new Pamph_Idle_Cnvs(count,action.move.text)
                    case "liner": return new Pamph_FrontWalk_Cnvs(count,Math.round(count / action.move.dcell.evaluate(person.variables)),mode)
                    case "back": return new Pamph_BackWalk_Cnvs(count,Math.round(count / action.move.dcell.evaluate(person.variables)),mode)
                    case "rotate": 
                        // MEMO シーンをまたいだ連続の方転は繋げれるけど、同シーン内で連続してたら正しく動作しない
                        const normalRelRet = new Pamph_Rotate_Cnvs(
                            action.move.rotateAngle.evaluate(person.variables,true),
                            nextState.rotateAngle,
                            count,
                            mode
                        )
                        if(sceneIndex > 0 && accCount === 0 && action.count.evaluate(person.variables)){// 最初の0ct方転は前シーンの最後の0ct方転に吸収されうる
                            const preLastAction = getLastAction(scenes[sceneIndex-1],person.id)
                            if(preLastAction && preLastAction.count.evaluate(person.variables) === 0){
                                if(preLastAction.move.type === "rotate") return null
                                if(preLastAction.move.type === "absRotate") return null
                            }
                        }
                        if(sceneIndex < scenes.length-1 && accCount === sumCount && action.count.evaluate(person.variables)){ // 最後の0ct方転は次シーンの最初の0ct方転を吸収しうる
                            const nextScenesMe = scenes[sceneIndex+1].persons.find(p => p.id = person.id)
                            const nextFirstAction = getFirstAction(scenes[sceneIndex+1],person.id)
                            if(nextScenesMe && nextFirstAction && nextFirstAction.count.evaluate(person.variables)){
                                switch(nextFirstAction.move.type){
                                    case "rotate":
                                        const relRotateAngle = action.move.rotateAngle.evaluate(person.variables,true) + 
                                            nextFirstAction.move.rotateAngle.evaluate(nextScenesMe.variables,true)
                                        return new Pamph_Rotate_Cnvs(
                                            relRotateAngle,
                                            curState.rotateAngle + relRotateAngle,
                                            count,
                                            mode
                                        )
                                    case "absRotate":
                                        const absRotateAngle = nextFirstAction.move.rotateAngle.evaluate(nextScenesMe.variables,true)
                                        return new Pamph_AbsRotate_Cnvs(
                                            absRotateAngle - curState.rotateAngle,
                                            absRotateAngle,
                                            count,
                                            mode
                                        )
                                    case "slide":
                                    case "danceSlide":
                                    case "revolve":
                                    case "dyclon":
                                        // このときは次のシーンの最初に必ず「次方向」の方転が入るのでここでの方転は不要
                                        return null
                                }
                            }
                        }
                        // 普通のとき
                        return normalRelRet
                    case "absRotate":
                        // MEMO シーンをまたいだ連続の方転は繋げれるけど、同シーン内で連続してたら正しく動作しない
                        const normalAbsRet = new Pamph_AbsRotate_Cnvs(nextState.rotateAngle - curState.rotateAngle, nextState.rotateAngle, count, mode)
                        if(sceneIndex > 0 && accCount === 0 && action.count.evaluate(person.variables)){// 最初の0ct方転は前シーンの最後の0ct方転に吸収されうる
                            const preLastAction = getLastAction(scenes[sceneIndex-1],person.id)
                            if(preLastAction && preLastAction.count.evaluate(person.variables) === 0){
                                if(preLastAction.move.type === "rotate") return null
                                if(preLastAction.move.type === "absRotate") return null
                            }
                        }
                        if(sceneIndex < scenes.length-1 && accCount === sumCount && action.count.evaluate(person.variables)){ // 最後の0ct方転は次シーンの最初の0ct方転を吸収しうる
                            const nextScenesMe = scenes[sceneIndex+1].persons.find(p => p.id = person.id)
                            const nextFirstAction = getFirstAction(scenes[sceneIndex+1],person.id)
                            if(nextScenesMe && nextFirstAction && nextFirstAction.count.evaluate(person.variables)){
                                switch(nextFirstAction.move.type){
                                    case "rotate":
                                        const absRotateAngle1 = action.move.rotateAngle.evaluate(person.variables,true) + 
                                            nextFirstAction.move.rotateAngle.evaluate(nextScenesMe.variables,true)
                                        return new Pamph_AbsRotate_Cnvs(
                                            absRotateAngle1 - curState.rotateAngle,
                                            absRotateAngle1,
                                            count,
                                            mode
                                        )
                                    case "absRotate":
                                        const absRotateAngle2 = nextFirstAction.move.rotateAngle.evaluate(nextScenesMe.variables,true)
                                        return new Pamph_AbsRotate_Cnvs(
                                            absRotateAngle2 - curState.rotateAngle,
                                            absRotateAngle2,
                                            count,
                                            mode
                                        )
                                    case "slide":
                                    case "danceSlide":
                                    case "revolve":
                                    case "dyclon":
                                        // このときは次のシーンの最初に必ず「次方向」の方転が入るのでここでの方転は不要
                                        return null
                                }
                            }
                        }
                        // 普通のとき
                        return normalAbsRet
                    case "revolve":
                        const toAngle = curState.pos.angle(massCanvasDef.centerPx) + (action.move.revolveAngle.evaluate(person.variables) >= 0 ? -90 : 90)
                        return new Pamph_Slide_Set_Cnvs(count,toAngle,mode,"大回")
                    case "dyclon":
                        const [frames,_] = createFramesFromAction(action,curState,1,scene.slides,person)
                        const to = frames[1]?.pos || _.pos
                        return new Pamph_Slide_Set_Cnvs(count,frames[0].pos.angle(to),mode,"ダイクロン")
                    case "slide":
                        return new Pamph_Slide_Set_Cnvs(count,nextState.rotateAngle,mode,action.move.text)
                    case "sit": return new Pamph_Sit_Cnvs(count)
                    case "stand": return new Pamph_Stand_Cnvs(count)

                    case "dance": 
                    case "danceSlide": 
                        return new Pamph_Dance_Cnvs(count,action.move.text)
                    case "wave": return new Pamph_Wave_Cnvs(count,action.move.text)
                }
            }).filter(v => v !== null)

            
            // 初期方向設定による強制的な方転について
            // MEMO 強制的な方転は通常の方転と連続してもつながらないです！
            if(sceneIndex < scenes.length-1){
                const nextScenesMe = scenes[sceneIndex+1].persons.find(p => p.id = person.id)
                if(nextScenesMe){
                    const firstActType = getFirstAction(scenes[sceneIndex+1],nextScenesMe.id)?.move.type 
                    if(
                        firstActType && 
                        firstActType !== "slide" && 
                        firstActType !== "rotate" &&
                        firstActType !== "absRotate" &&
                        firstActType !== "dyclon" &&
                        firstActType !== "revolve" &&
                        firstActType !== "danceSlide"
                    ){ // 次シーンの最初にスライド・方転が入ると初期方向設定による強制的な方転が無視される趣旨のif文
                        const curLastRotateAngle = simLastState(person, scene).rotateAngle
                        if(curLastRotateAngle !== nextScenesMe.startState.rotateAngle){ // 最後の向きと初期方向設定の向きが違ったら
                            console.log(person.id,"次方向",curLastRotateAngle, nextScenesMe.startState.rotateAngle)// FROM グループで相談
                            macroElems.push(new Pamph_Force_Rotate_Cnvs(nextScenesMe.startState.rotateAngle,mode))
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

export type PamphMode = "MoonFlag"|"MoonFemale"|"SunShield"|"SunFemale"

const upperTextY = 15
const underTextY = 185
class Pamph_FrontWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
    constructor(count: number, cpcell: number, mode: PamphMode){
        super("canvas",{class: "pamph_move"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"
        ctx.font = "50px sans-serif"
        ctx.fillText(`${count}`,...center)
        ctx.font = "30px sans-serif"
        let underText = ""
        let upperText = ""
        switch(mode){
            case "MoonFlag":
            case "SunShield":
                underText = `1マス${cpcell}`
                break
            case "MoonFemale":
            case "SunFemale":
                if(cpcell === 2){
                    upperText = "倍"
                }else if(cpcell === 4){
                    upperText = "定"
                }else{
                    underText = `1マス${cpcell}`
                }
                break
        }
        ctx.fillText(upperText,center[0],upperTextY)
        ctx.fillText(underText,center[0],underTextY)
    }
}
class Pamph_BackWalk_Cnvs extends Narve.Component<HTMLCanvasElement> {
    constructor(count: number, cpcell: number, mode: PamphMode){
        super("canvas",{class: "pamph_move"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"
        ctx.font = "50px sans-serif"
        ctx.fillText(`${count}`,...center)

        let upperText = ""
        let underText = "後"
        switch(mode){
            case "MoonFlag":
            case "SunShield":
                underText += `1マス${cpcell}`
                break
            case "MoonFemale":
            case "SunFemale":
                if(cpcell === 2){
                    upperText = "倍"
                }else if(cpcell === 4){
                    upperText = "定"
                }else{
                    underText += `1マス${cpcell}`
                }
                break
        }
        ctx.fillText(upperText,center[0],upperTextY)
        ctx.fillText(underText,center[0],underTextY)
    }
}
class Pamph_Break_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 正方形
    constructor(count: number,text: string = ""){
        super("canvas",{class: "pamph_break"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.strokeRect(15,35,130,130)
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"
        ctx.font = "50px sans-serif"
        ctx.fillText(`${count}`,...center)
        ctx.font = "30px sans-serif"
        ctx.fillText(text,center[0],underTextY)
    }
}
class Pamph_Idle_Cnvs  extends Narve.Component<HTMLCanvasElement> {
    // 正方形
    constructor(count: number,text: string = ""){
        super("canvas",{class: "pamph_spin"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.strokeRect(15,35,130,130)

        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"

        ctx.font = "30px sans-serif"
        ctx.fillText("足踏み",center[0],upperTextY)

        // カウント
        ctx.font = "50px sans-serif"
        ctx.fillText(`${count}`,...center)

        // テキスト
        ctx.font = "30px sans-serif"
        ctx.fillText(text,center[0],underTextY)
    }
}
class Pamph_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 円＋方向の線
    constructor(relAngle: number,toAngle: number,count: number,pamphMode: PamphMode){
        super("canvas",{class: "pamph_spin"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        const R = 40
        const lineR = 60
        this.elem.width = 160
        this.elem.height = 200
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.arc(...center,R,0,2*Math.PI)
        ctx.stroke()
        const diffStart = new PointDiff(R,0)
        const diffEnd = new PointDiff(lineR,0)

        diffStart.revolve(toAngle)
        diffEnd.revolve(toAngle)
        const cenPoint = new Point(...center)
        ctx.moveTo(...cenPoint.add(diffStart).getPair())
        ctx.lineTo(...cenPoint.add(diffEnd).getPair())
        ctx.stroke()
        
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"

        // カウント
        ctx.font = "50px sans-serif"
        ctx.fillText(`${count}`,...center)

        // 向きと方転角度
        ctx.font = "30px sans-serif"
        // 絶対方向
        // パンフごとで表示分ける
        if(pamphMode === "MoonFemale" || pamphMode === "SunFemale")
        if(toAngle % 45 === 0){// キリが良ければ
            ctx.fillText(`t${(90 - toAngle + 360) % 360}°`,center[0],upperTextY)
        }
        // 相対方向
        let spinto = relAngle>=0? "左" : "右"
        relAngle = Math.abs(relAngle) % 360
        if(relAngle === 180 && (pamphMode === "SunFemale" || pamphMode === "MoonFlag")){
            spinto = ""
        }
        if(relAngle === 0) spinto = ""
        ctx.fillText(`${spinto}${relAngle}°`,center[0],underTextY)
    }
}
class Pamph_AbsRotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 円＋方向の線
    constructor(relAngle: number,toAngle: number,count: number,pamphMode: PamphMode){
        super("canvas",{class: "pamph_spin"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        const R = 40
        const lineR = 60
        this.elem.width = 160
        this.elem.height = 200
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.arc(...center,R,0,2*Math.PI)
        ctx.stroke()
        const diffStart = new PointDiff(R,0)
        const diffEnd = new PointDiff(lineR,0)

        diffStart.revolve(toAngle)
        diffEnd.revolve(toAngle)
        const cenPoint = new Point(...center)
        ctx.moveTo(...cenPoint.add(diffStart).getPair())
        ctx.lineTo(...cenPoint.add(diffEnd).getPair())
        ctx.stroke()
        
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"

        // カウント
        ctx.font = "50px sans-serif"
        ctx.fillText(`${count}`,...center)

        // 向きと方転角度
        ctx.font = "30px sans-serif"
        // 絶対方向
        ctx.fillText(`t${(90 - toAngle + 360) % 360}°`,center[0],upperTextY)
        // 相対方向
        // パンフごとで表示分ける
        if(pamphMode === "MoonFemale" || pamphMode === "SunFemale")
        if(relAngle % 45 === 0){
            let spinto = relAngle>=0? "左" : "右"
            relAngle = Math.abs(relAngle) % 360
            if(relAngle === 180 && (pamphMode === "SunFemale")){
                spinto = ""
            }
            if(relAngle === 0) spinto = ""
            ctx.fillText(`${spinto}${relAngle}°`,center[0],underTextY)
        }
    }
}

// スライドによる方転とスライドの記号をセットにしたもの
class Pamph_Slide_Set_Cnvs extends Narve.Component{
    constructor(count: number,toAngle: number,pamphMode: PamphMode,text: string = ""){
        super("div",{},
            new Pamph_Force_Rotate_Cnvs(toAngle,pamphMode),
            new Pamph_Slide_Cnvs(count,text)
        )
    }
}
// スライド・初期方向設定による強制的な方転を示す記号
class Pamph_Force_Rotate_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 円＋方向の線
    constructor(toAngle: number,pamphMode: PamphMode){
        super("canvas",{class: "pamph_spin"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        const R = 40
        const lineR = 60
        this.elem.width = 160
        this.elem.height = 200
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.arc(...center,R,0,2*Math.PI)
        ctx.stroke()

        const diffStart = new PointDiff(R,0)
        const diffEnd = new PointDiff(lineR,0)

        diffStart.revolve(toAngle)
        diffEnd.revolve(toAngle)
        const cenPoint = new Point(...center)
        ctx.moveTo(...cenPoint.add(diffStart).getPair())
        ctx.lineTo(...cenPoint.add(diffEnd).getPair())
        ctx.stroke()

        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"

        // カウント
        ctx.font = "50px sans-serif"
        ctx.fillText("0",...center)

        // 向きと方転角度
        ctx.font = "30px sans-serif"
        // 絶対方向
        if(pamphMode === "MoonFemale" || pamphMode === "SunFemale")
        if(toAngle % 45 === 0){// キリが良ければ
            ctx.fillText(`t${(90 - toAngle + 360) % 360}°`,center[0],upperTextY)
        }

        ctx.fillText("次方向",center[0],underTextY)
    }
}
class Pamph_Slide_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 正三角形
    constructor(count: number,text: string = ""){
        super("canvas",{class: "pamph_slide"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200

        const edgeLen = 130
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.moveTo(center[0],30)
        ctx.lineTo(center[0]-edgeLen/2,30 + edgeLen * Math.sqrt(3)/2)
        ctx.lineTo(center[0]+edgeLen/2,30 + edgeLen * Math.sqrt(3)/2)
        ctx.closePath()
        ctx.stroke()
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"

        // カウント
        ctx.font = `50px sans-serif`
        ctx.fillText(`${count}`,center[0],30 + edgeLen * Math.sqrt(3)/3)

        // テキスト
        ctx.font = '30px sans-serif'
        ctx.fillText(text,center[0],underTextY)
    }
}
class Pamph_Sit_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 正三角形
    constructor(count: number){
        super("canvas",{class: "pamph_slide"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200

        const edgeLen = 130
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.moveTo(center[0],30)
        ctx.lineTo(center[0]-edgeLen/2,30 + edgeLen * Math.sqrt(3)/2)
        ctx.lineTo(center[0]+edgeLen/2,30 + edgeLen * Math.sqrt(3)/2)
        ctx.closePath()
        ctx.stroke()
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"
        ctx.font = `50px sans-serif`
        ctx.fillText(`${count}`,center[0],30 + edgeLen * Math.sqrt(3)/3)
        ctx.font = `30px sans-serif`
        ctx.fillText("座り",center[0],underTextY)
    }
}
class Pamph_Stand_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 正三角形
    constructor(count: number){
        super("canvas",{class: "pamph_slide"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200

        const edgeLen = 130
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.moveTo(center[0],30)
        ctx.lineTo(center[0]-edgeLen/2,30 + edgeLen * Math.sqrt(3)/2)
        ctx.lineTo(center[0]+edgeLen/2,30 + edgeLen * Math.sqrt(3)/2)
        ctx.closePath()
        ctx.stroke()
        ctx.textBaseline = "middle"
        ctx.textAlign    = "center"
        ctx.font = `50px sans-serif`
        ctx.fillText(`${count}`,center[0],30 + edgeLen * Math.sqrt(3)/3)
        ctx.font = `30px sans-serif`
        ctx.fillText("立ち",center[0],underTextY)
    }
}

class Pamph_Dance_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // ハート
    constructor(count: number,text: string = ""){
        super("canvas",{class: "pamph_slide"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200

        const heartVertex: [number, number] = [center[0],165]
        const R = 130/4
        const heartCenter1: [number, number] = [ 15 + R, 35 + R]
        const heartCenter2: [number, number] = [145 - R, 35 + R]
        
        const d = Math.hypot(heartCenter1[0] - heartVertex[0],heartCenter1[1] - heartVertex[1])
        const rad = Math.atan2(R,Math.sqrt(d*d - R*R))

        const heartStart1: [number,number] = [heartCenter1[0] - R * Math.cos(rad*2), heartCenter1[1] + R*Math.sin(rad*2)]
        ctx.beginPath()
        ctx.moveTo(...heartVertex)
        
        ctx.lineTo(...heartStart1)
        ctx.arc(...heartCenter1,R,Math.PI - rad*2, 0, false)
        ctx.arc(...heartCenter2,R,Math.PI,rad*2,false)
        ctx.closePath()
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.stroke() 
        
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // カウント
        ctx.font = `50px sans-serif`
        ctx.fillText(`${count}`, ...center)

        // テキスト
        ctx.font = '30px sans-serif'
        ctx.fillText(text,center[0],underTextY)
    }
}
class Pamph_Wave_Cnvs extends Narve.Component<HTMLCanvasElement> {
    // 扇形
    constructor(count: number,text: string = ""){
        super("canvas",{class: "pamph_slide"})
        const ctx = this.elem.getContext("2d")
        if(ctx === null) return

        const center: [number,number] = [80,100]
        this.elem.width = 160
        this.elem.height = 200

        const fanCenter: [number, number] = [center[0],170]
        const R = 130
        const rad = Math.PI/3
        ctx.beginPath()
        ctx.moveTo(...fanCenter)
        ctx.lineTo(fanCenter[0] - R*Math.sin(rad/2), fanCenter[1] - R*Math.cos(rad/2))
        ctx.arc(...fanCenter,R,-Math.PI/2 - rad/2, -Math.PI/2 + rad/2,false)
        ctx.closePath()
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3
        ctx.stroke() 
        
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // カウント
        ctx.font = `50px sans-serif`
        ctx.fillText(`${count}`, ...center)

        // テキスト
        ctx.font = '30px sans-serif'
        ctx.fillText(text,center[0],underTextY)
    }
}