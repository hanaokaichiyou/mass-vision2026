import { massCanvasDef } from "./massCanvasDef"
import { MathExp } from "./mathExp"
import Point from "./Point"
import FastPriorityQueue from "fastpriorityqueue"

export type action = {
    move: act_move
    count: MathExp.ExpressionTree
}
export type act_move = move_break|move_liner|move_back|move_rotate|move_revolve|move_slide|/*move_genRevolve|*/move_dyclon
export type move_break = {
    type: "break"
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
export type move_revolve = {
    type: "revolve"
    center: Point
    revolveAngle: MathExp.ExpressionTree
}
export type move_slide = {
    type: "slide"
    slideIndex: MathExp.ExpressionTree
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
export type moveType = "break"|"rotate"|"liner"|"back"|"revolve"|"slide"|"dyclon"

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
            this.macroAndActsIsDiff = false
        }
        return this._actions
    }
    totalCount(variables: { [key: string]: number }): number{
        return this.actions.reduce((acc,cur) => {
            return acc+cur.count.evaluate(variables,true)
        },0)
    }
}

// _[name]はカウントをまだつけていないの意味
// MEMO ダイクロン左回転しかできません。ごめん…
const MathReg = new RegExp(`(?:${MathExp.expReg.source})+`)
const countReg = new RegExp(`\\[(${MathReg.source})\\]`);// /\[(\d+)\]/
const _linerReg = new RegExp(`f(?:\{(${MathReg.source})\})?`)
const _backReg = new RegExp(`bw(?:\{(${MathReg.source})\})?`)
const _breakReg = /[bi]/
const _revolveReg = new RegExp(`r([rl])\{(${MathReg.source})\}`)
const _slideReg = new RegExp(`s\{(${MathReg.source})\}`)
const _dyclonReg = new RegExp(`dl\{(${MathReg.source})\}`)

const linerReg = new RegExp(_linerReg.source + countReg.source,"g")
const backReg = new RegExp(_backReg.source + countReg.source,"g")
const breakReg = new RegExp(_breakReg.source + countReg.source,"g")
const rotateReg = new RegExp(`t([rl])\{(${MathReg.source})\}`,"g")
const revolveReg = new RegExp(_revolveReg.source + countReg.source,"g")
const slideReg = new RegExp(_slideReg.source + countReg.source,"g")
const dyclonReg = new RegExp(_dyclonReg.source + countReg.source,"g")


function text2Actions(text: string):action[]{
    let pureText = text.replace(/[\s\t\n　]/g,"")
    const Q = new FastPriorityQueue<[RegExpExecArray,moveType]>((a,b) => {
        return a[0].index < b[0].index
    })
    const allRegs = [linerReg,backReg,breakReg,rotateReg,revolveReg,slideReg,dyclonReg]
    const moveTypeNames:moveType[] = ["liner","back","break","rotate","revolve","slide","dyclon"]
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
            case "back":
                action = matchToBack(match)
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
    try{
        const count = new MathExp.ExpressionTree(match[1])
        return {
            move: {
                type: "break"
            },
            count: count
        }
    }catch{
        return null
    }
}
function matchToLiner(match: RegExpExecArray): action|null{
    if(match[2] === undefined) return null
    if(match[1] === undefined) match[1] = "3"
    try {
        const countPerCell = new MathExp.ExpressionTree(match[1])
        const count = new MathExp.ExpressionTree(match[2])
        
        return {
            move: {
                type: "liner",
                dcell: new MathExp.ExpressionTree(`(${count.source})/(${countPerCell.source})`)
            },
            count: count
        }
    }catch{
        return null
    }
}
function matchToBack(match: RegExpExecArray): action|null{
    if(match[2] === undefined) return null
    if(match[1] === undefined) match[1] = "3"
    try {
        const countPerCell = new MathExp.ExpressionTree(match[1])
        const count = new MathExp.ExpressionTree(match[2])
        
        return {
            move: {
                type: "back",
                dcell: new MathExp.ExpressionTree(`(${count.source})/(${countPerCell.source})`)
            },
            count: count
        }
    }catch{
        return null
    }
}
function matchToRotate(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    try{
        const rotateAngle = new MathExp.ExpressionTree(`${match[1]==="r"?"(0-1)":"1"}*(${match[2]})`)
        return {
            move: {
                type: "rotate",
                rotateAngle: rotateAngle
            },
            count: new MathExp.ExpressionTree("0")
        }
    }catch{
        return null
    }
}
function matchToRevolve(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined || match[3] === undefined) return null

    try{
        const revolveAngle = new MathExp.ExpressionTree(`${match[1]==="r"?"(0-1)":"1"}*(${match[2]})`)
        const count = new MathExp.ExpressionTree(match[3])
        return {
            move: {
                type: "revolve",
                revolveAngle: revolveAngle,
                center: massCanvasDef.centerPx
            },
            count: count
        }
    }catch{
        return null
    }
}
function matchToSlide(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    
    try{
        // match[1]はインデックスではなくスライド番号(1-based)
        const slideIndex = new MathExp.ExpressionTree(match[1] + "-1")
        const count = new MathExp.ExpressionTree(match[2])
        return {
            move: {
                type: "slide",
                slideIndex : slideIndex
            },
            count: count
        }
    }catch{
        return null
    }
}
function matchToDyclon(match: RegExpExecArray): action|null{
    if(match[1] === undefined || match[2] === undefined) return null
    const revolveAngle = new MathExp.ExpressionTree(match[1])
    const count = new MathExp.ExpressionTree(match[2])
    return {
        move: {
            type: "dyclon",
            revolveAngle: revolveAngle,
            center: massCanvasDef.centerPx,
            lastRaius: new MathExp.ExpressionTree(massCanvasDef.dyclonLastR.toString())
        },
        count: count
    }
}