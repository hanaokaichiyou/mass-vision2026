import { massCanvasDef } from "./massCanvasDef"
import Point from "./Point"
import FastPriorityQueue from "fastpriorityqueue"

export type action = {
    move: act_move
    count: number
}
export type act_move = move_break|move_liner|move_rotate|move_revolve|move_slide|/*move_genRevolve|*/move_dyclon
export type move_break = {
    type: "break"
}
export type move_liner = {
    type: "liner"
    dcell: number
}
export type move_rotate = {
    type: "rotate"
    rotateAngle: number
}
export type move_revolve = {
    type: "revolve"
    center: Point
    revolveAngle: number
}
export type move_slide = {
    type: "slide"
    slideIndex: number
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
    revolveAngle: number
    center: Point
    lastRaius: number
}
export type moveType = "break"|"rotate"|"liner"|"revolve"|"slide"|"dyclon"

export default class Macro {
    protected _macroStr: string = ""
    protected _actions: action[] = []
    protected macroAndActsIsDiff = false
    protected _totalCount = 0
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
            this._totalCount = this._actions.reduce((acc,cur) => acc+cur.count,0)
            this.macroAndActsIsDiff = false
        }
        return this._actions
    }
    get totalCount(): number{
        if(this.macroAndActsIsDiff){
            this._actions = text2Actions(this.macroStr)
            this._totalCount = this._actions.reduce((acc,cur) => acc+cur.count,0)
            this.macroAndActsIsDiff = false
        }
        return this._totalCount
    }
}

// _nameはカウントをまだつけていないの意味
// MEMO ダイクロン左回転しかできません。ごめん…
const countReg = /\[(\d+)\]/
const _linerReg = /f(\d*)/
const _breakReg = /[bi]/
const _revolveReg = /r([rl])(\d+)/
const _slideReg = /s(\d+)/
const _dyclonReg = /dl(\d+)/

const linerReg = new RegExp(_linerReg.source + countReg.source,"g")
const breakReg = new RegExp(_breakReg.source + countReg.source,"g")
const rotateReg = /t([rl])(\d+)/g
const revolveReg = new RegExp(_revolveReg.source + countReg.source,"g")
const slideReg = new RegExp(_slideReg.source + countReg.source,"g")
const dyclonReg = new RegExp(_dyclonReg.source + countReg.source,"g")


function text2Actions(text: string):action[]{
    let pureText = text.replace(/[\s\t\n　]/g,"")
    const Q = new FastPriorityQueue<[RegExpExecArray,moveType]>((a,b) => {
        return a[0].index < b[0].index
    })
    const allRegs = [linerReg,breakReg,rotateReg,revolveReg,slideReg,dyclonReg]
    const moveTypeNames:moveType[] = ["liner","break","rotate","revolve","slide","dyclon"]
    allRegs.forEach((reg,i) => {
        while(1){
            const match = reg.exec(pureText)
            if(match === null) break
            const name = moveTypeNames[i]
            Q.add([match,name])
        }
    })
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
            case "liner":
                action = matchToLiner(match)
                break
            case "rotate":
                action = matchToRotate(match)
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
        }
        if(action === null) break
        actions.push(action)
    }
    return actions
}

function matchToBreak(match: RegExpExecArray): action|null{
    if(match[1] === undefined) return null
    const count = Number(match[1])
    if(Number.isNaN(count)) return null
    return {
        move: {
            type: "break"
        },
        count: count
    }
}
function matchToLiner(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    const countPerCell = Number(match[1])||3
    const count = Number(match[2])
    if(Number.isNaN(count)) return null
    
    return {
        move: {
            type: "liner",
            dcell: count/countPerCell
        },
        count: count
    }
}
function matchToRotate(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    const rotateAngle = Number(match[2]) * (match[1]==="r"?-1:1)
    if(Number.isNaN(rotateAngle)) return null
    return {
        move: {
            type: "rotate",
            rotateAngle: rotateAngle
        },
        count: 0
    }
}
function matchToRevolve(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined || match[3] === undefined) return null
    
    const revolveAngle = Number(match[2]) * (match[1]==="r"?-1:1)
    if(Number.isNaN(revolveAngle)) return null
    const count = Number(match[3])
    if(Number.isNaN(count)) return null
    return {
        move: {
            type: "revolve",
            revolveAngle: revolveAngle,
            center: massCanvasDef.centerPx
        },
        count: count
    }
}
function matchToSlide(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    
    // 実際にはインデックスではなくスライド番号(1-based)
    const slideIndex = Number(match[1])
    if(Number.isNaN(slideIndex)) return null
    const count = Number(match[2])
    if(Number.isNaN(count)) return null
    return {
        move: {
            type: "slide",
            slideIndex : slideIndex-1
        },
        count: count
    }
}
function matchToDyclon(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    const revolveAngle = Number(match[1])
    if(Number.isNaN(revolveAngle)) return null
    const count = Number(match[2])
    if(Number.isNaN(count)) return null
    return {
        move: {
            type: "dyclon",
            revolveAngle: revolveAngle,
            center: massCanvasDef.centerPx,
            lastRaius: massCanvasDef.dyclonLastR
        },
        count: count
    }
}