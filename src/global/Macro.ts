import { massCanvasDef } from "./massCanvasDef"
import { MathExp } from "./mathExp"
import Point from "./Point"
import FastPriorityQueue from "fastpriorityqueue"

/* マクロ追加手順
export type move_[name] = ...を追加
type act_moveに追加
export type moveTypeに追加
macroの正規表現を追加
text2Action
    allRegsに追加
    moveTypeNamesに追加
    switch文にcase [name]:を追加
matchTo[name]を追加

createFromMacto.tsにて
function create[name]Framesを追加
createFramesFromActionのswitch文に追加

createPamphlet.tsにて
class Pamph_[Name]_Cnvsを追加
createPamphletのswitch文に追加
スライド系なら「初期方向による強制的な方転について」の下のifの条件式にも追加する
*/

export type action = {
    move: act_move
    count: MathExp.ExpressionTree
    isHiddenInPamph: boolean
    isHiddenInAnimation: boolean
}
export type act_move = move_break|move_idle|move_liner|move_back|move_rotate|move_absRotate|move_revolve|move_slide|/*move_genRevolve|*/move_dyclon|move_sit|move_stand|move_dance|move_dance_slide|move_wave
export type move_break = {
    type: "break"
    text: string
}
export type move_idle = {
    type: "idle"
    text: string
}
export type move_liner = {
    type: "liner"
    dcell: MathExp.ExpressionTree
}
export type move_back = {
    type: "back"
    dcell: MathExp.ExpressionTree
}
export type move_rotate = {
    type: "rotate"
    rotateAngle: MathExp.ExpressionTree
}
export type move_absRotate = {
    type: "absRotate"
    rotateAngle: MathExp.ExpressionTree
}
export type move_revolve = {
    type: "revolve"
    center: Point
    revolveAngle: MathExp.ExpressionTree
}
export type move_slide = {
    type: "slide"
    slideIndex: MathExp.ExpressionTree,
    text: string
}
// export type move_genRevolve = {
//     type: "genRevolve"
//     revolveAngle: number
//     center: Point
//     centerMacro: Macro
//     lastRadius: number
// }
export type move_dyclon = {
    type: "dyclon"
    revolveAngle: MathExp.ExpressionTree
    center: Point
    lastRaius: MathExp.ExpressionTree
}
export type move_sit = {
    type: "sit"
}
export type move_stand = {
    type: "stand"
}
export type move_dance = {
    type: "dance"
    text: string
}
export type move_dance_slide = {
    type: "danceSlide"
    slideIndex: MathExp.ExpressionTree
    text: string
}
export type move_wave = {
    type: "wave"
    text: string
}
export type moveType = "break"|"idle"|"rotate"|"absRotate"|"liner"|"back"|"revolve"|"slide"|"dyclon"|"sit"|"stand"|"dance"|"danceSlide"|"wave"

export default class Macro {
    protected _macroStr: string = ""
    protected _actions: action[] = []
    protected macroAndActsIsDiff = false
    constructor(macroStr?: string){
        if(macroStr !== undefined){
            this.macroStr = macroStr
        }
    }
    set macroStr(str: string){
        this._macroStr = str
        this.macroAndActsIsDiff = true
    }
    get macroStr(){
        return this._macroStr
    }
    get actions(): action[]{
        if(this.macroAndActsIsDiff){
            this._actions = text2Actions(this.macroStr)
            console.log("actions",this._actions)
            this.macroAndActsIsDiff = false
        }
        return this._actions
    }
    totalCount(variables: { [key: string]: number }): number{
        return this.actions.reduce((acc,cur) => {
            if(cur.isHiddenInAnimation) return acc
            return acc+cur.count.evaluate(variables,true)
        },0)
    }
}

// _[name]はカウントをまだつけていないの意味
// MEMO ダイクロン左回転しかできません。ごめん…
const MathReg = new RegExp(`(?:${MathExp.expReg.source})+`)
const countReg = new RegExp(`\\[(${MathReg.source})\\]`);// /\[(\d+)\]/
const textReg = new RegExp(/[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠ー0-9a-zA-Z]*/)

const _linerReg = new RegExp(`f(?:\{(${MathReg.source})\})?`)
const _backReg = new RegExp(`bw(?:\{(${MathReg.source})\})?`)
const _breakReg = new RegExp(`b(?:<(${textReg.source})>)?`)
const _idleReg = new RegExp(`i(?:<(${textReg.source})>)?`)
const _revolveReg = new RegExp(`r([rl])\{(${MathReg.source})\}`)
const _slideReg = new RegExp(`s(?:<(${textReg.source})>)?\{(${MathReg.source})\}`)
const _dyclonReg = new RegExp(`dl\{(${MathReg.source})\}`)
const _sitReg = new RegExp(`sit`)
const _standReg = new RegExp(`std`)
const _danceReg = new RegExp(`dc(?:<(${textReg.source})>)?`)
const _danceSlideReg = new RegExp(`dcs(?:<(${textReg.source})>)?\{(${MathReg.source})\}`)
const _waveReg = new RegExp(`wv(?:<(${textReg.source})>)?`)

const startReg = /(?<=^|[^a-zA-Z])([\^\*]?)/ // マクロの開始を判定するために使う(dcs...はs...を含んでしまう問題の解消)

const linerReg        = new RegExp(startReg.source + _linerReg.source + countReg.source,"g")
const backReg         = new RegExp(startReg.source + _backReg.source + countReg.source,"g")
const breakReg        = new RegExp(startReg.source + _breakReg.source + countReg.source,"g")
const idleReg         = new RegExp(startReg.source + _idleReg.source + countReg.source,"g")
const rotateReg       = new RegExp(startReg.source + `t([rl])\{(${MathReg.source})\}`,"g")
const absRotateReg    = new RegExp(startReg.source + `t\{(${MathReg.source})\}`,"g")
const nctRotateReg    = new RegExp(startReg.source + `t([rl])h\{(${MathReg.source})\}`+`\\[(${MathReg.source})\\]`,"g")
const nctAbsRotateReg = new RegExp(startReg.source + `th\{(${MathReg.source})\}`+`\\[(${MathReg.source})\\]`,"g")
const revolveReg      = new RegExp(startReg.source + _revolveReg.source + countReg.source,"g")
const slideReg        = new RegExp(startReg.source + _slideReg.source + countReg.source,"g")
const dyclonReg       = new RegExp(startReg.source + _dyclonReg.source + countReg.source,"g")
const sitReg          = new RegExp(startReg.source + _sitReg.source + countReg.source,"g")
const standReg        = new RegExp(startReg.source + _standReg.source + countReg.source,"g")
const danceReg        = new RegExp(startReg.source + _danceReg.source + countReg.source,"g")
const danceSlideReg   = new RegExp(startReg.source + _danceSlideReg.source + countReg.source,"g")
const waveReg         = new RegExp(startReg.source + _waveReg.source + countReg.source,"g")

console.log(linerReg.source)

function text2Actions(text: string):action[]{
    let pureText = text.replace(/[\s\t\n　]/g,"")
    const Q = new FastPriorityQueue<[RegExpExecArray,moveType]>((a,b) => {
        return a[0].index < b[0].index
    })
    const allRegs = [linerReg,backReg,breakReg,idleReg,rotateReg,absRotateReg,nctRotateReg,nctAbsRotateReg,revolveReg,slideReg,dyclonReg,sitReg,standReg,danceReg,danceSlideReg,waveReg]
    const moveTypeNames:moveType[] = ["liner","back","break","idle","rotate","absRotate","rotate","absRotate","revolve","slide","dyclon","sit","stand","dance","danceSlide","wave"]
    allRegs.forEach((reg,i) => {
        const name = moveTypeNames[i]
        while(1){
            const match = reg.exec(pureText)
            if(name === "liner"){
                console.log("match",match)
            }
            if(match === null) break
            Q.add([match,name])
        }
    })
    console.log("Queue",Q)
    let actions:action[] = []
    while(!Q.isEmpty()){
        const top = Q.poll()
        if(top === undefined) break
        const [match,name] = top
        let action: action|null = null

        switch(name){
            case "break":
                action = matchToBreak(match)
                break
            case "idle":
                action = matchToIdle(match)
                break
            case "liner":
                action = matchToLiner(match)
                break
            case "back":
                action = matchToBack(match)
                break
            case "rotate":
                action = matchToRotate(match)
                break
            case "absRotate":
                action = matchToAbsRotate(match)
                break
            case "revolve":
                action = matchToRevolve(match)
                break
            case "slide":
                action = matchToSlide(match)
                break
            case "dyclon":
                action = matchToDyclon(match)
                break
            case "sit":
                action = matchToSit(match)
                break
            case "stand":
                action = matchToStand(match)
                break
            case "dance":
                action = matchToDance(match)
                break
            case "danceSlide":
                action = matchToDanceSlide(match)
                break
            case "wave":
                action = matchToWave(match)
                break
        }
        if(action === null) break
        actions.push(action)
    }
    return actions
}

function matchToBreak(match: RegExpExecArray): action|null{
    if(match[3] === undefined) return null
    if(match[2] === undefined) match[2] = ""
    try{
        const count = new MathExp.ExpressionTree(match[3])
        return {
            move: {
                type: "break",
                text: match[2]
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToIdle(match: RegExpExecArray): action|null{
    if(match[3] === undefined) return null
    if(match[2] === undefined) match[2] = ""
    try{
        const count = new MathExp.ExpressionTree(match[3])
        return {
            move: {
                type: "idle",
                text: match[2]
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}

function matchToLiner(match: RegExpExecArray): action|null{
    if(match[3] === undefined) return null
    if(match[2] === undefined) match[2] = "3"
    try {
        const countPerCell = new MathExp.ExpressionTree(match[2])
        const count = new MathExp.ExpressionTree(match[3])
        
        return {
            move: {
                type: "liner",
                dcell: new MathExp.ExpressionTree(`(${count.source})/(${countPerCell.source})`)
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToBack(match: RegExpExecArray): action|null{
    if(match[3] === undefined) return null
    if(match[2] === undefined) match[2] = "3"
    try {
        const countPerCell = new MathExp.ExpressionTree(match[2])
        const count = new MathExp.ExpressionTree(match[3])
        
        return {
            move: {
                type: "back",
                dcell: new MathExp.ExpressionTree(`(${count.source})/(${countPerCell.source})`)
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToRotate(match: RegExpExecArray): action|null{
    if(match[2] === undefined || match[3] === undefined) return null
    let count = new MathExp.ExpressionTree("0")
    if(match[4] !== undefined){
        count = new MathExp.ExpressionTree(match[4])
    }
    try{
        const rotateAngle = new MathExp.ExpressionTree(`${match[2]==="r"?"(0-1)":"1"}*(${match[3]})`)
        return {
            move: {
                type: "rotate",
                rotateAngle: rotateAngle
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToAbsRotate(match: RegExpExecArray): action|null{
    if(match[2] === undefined) return null
    let count = new MathExp.ExpressionTree("0")
    if(match[3] !== undefined){
        count = new MathExp.ExpressionTree(match[3])
    }
    try{
        const rotateAngle = new MathExp.ExpressionTree(`${match[2]}`)
        return {
            move: {
                type: "absRotate",
                rotateAngle: rotateAngle
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToRevolve(match: RegExpExecArray): action|null{
    if(match[2] === undefined || match[3] === undefined || match[4] === undefined) return null

    try{
        const revolveAngle = new MathExp.ExpressionTree(`${match[2]==="r"?"(0-1)":"1"}*(${match[3]})`)
        const count = new MathExp.ExpressionTree(match[4])
        return {
            move: {
                type: "revolve",
                revolveAngle: revolveAngle,
                center: massCanvasDef.centerPx
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToSlide(match: RegExpExecArray): action|null{
    if(match[3] === undefined || match[4] === undefined) return null
    if(match[2] === undefined) match[2] = ""
    try{
        // match[2]はインデックスではなくスライド番号(1-based)
        const slideIndex = new MathExp.ExpressionTree(match[3] + "-1")
        const count = new MathExp.ExpressionTree(match[4])
        return {
            move: {
                type: "slide",
                slideIndex : slideIndex,
                text: match[2]
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToDyclon(match: RegExpExecArray): action|null{
    if(match[2] === undefined || match[3] === undefined) return null
    const revolveAngle = new MathExp.ExpressionTree(match[2])
    const count = new MathExp.ExpressionTree(match[3])
    return {
        move: {
            type: "dyclon",
            revolveAngle: revolveAngle,
            center: massCanvasDef.centerPx,
            lastRaius: new MathExp.ExpressionTree(massCanvasDef.dyclonLastR.toString())
        },
        count: count,
        isHiddenInPamph: match[1] === "*",
        isHiddenInAnimation: match[1] === "^"
    }
}
// MEMOカウントをいくつに指定しようが問答無用でカウントは1
function matchToSit(match: RegExpExecArray): action|null{      
    return {
        move: {
            type: "sit"
        },
        count: new MathExp.ExpressionTree("1"),
        isHiddenInPamph: match[1] === "*",
        isHiddenInAnimation: match[1] === "^"
    }
}
// MEMOカウントをいくつに指定しようが問答無用でカウントは1
function matchToStand(match: RegExpExecArray): action|null{
    return {
        move: {
            type: "stand"
        },
        count: new MathExp.ExpressionTree("1"),
        isHiddenInPamph: match[1] === "*",
        isHiddenInAnimation: match[1] === "^"
    }
}
function matchToDance(match: RegExpExecArray): action|null{
    if(match[3] === undefined) return null
    if(match[2] === undefined) match[2] = ""
    try{
        const count = new MathExp.ExpressionTree(match[3])
        return {
            move: {
                type: "dance",
                text: match[2]
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToDanceSlide(match: RegExpExecArray): action|null{
    if(match[3] === undefined || match[4] === undefined) return null
    if(match[2] === undefined) match[2] = ""
    
    try{
        // match[2]はインデックスではなくスライド番号(1-based)
        const slideIndex = new MathExp.ExpressionTree(match[3] + "-1")
        const count = new MathExp.ExpressionTree(match[4])
        return {
            move: {
                type: "danceSlide",
                slideIndex : slideIndex,
                text: match[2]
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}
function matchToWave(match: RegExpExecArray): action|null{
    if(match[3] === undefined) return null
    if(match[2] === undefined) match[2] = ""
    try{
        const count = new MathExp.ExpressionTree(match[3])
        return {
            move: {
                type: "wave",
                text: match[2]
            },
            count: count,
            isHiddenInPamph: match[1] === "*",
            isHiddenInAnimation: match[1] === "^"
        }
    }catch{
        return null
    }
}