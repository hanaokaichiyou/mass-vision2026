import { Narve, nr } from "narve";
import "./style/eightAngleSelect.css"
import { massCanvasDef } from "../../../global/massCanvasDef";
import Point from "../../../global/Point";

export default class EightAngleSelect extends Narve.Component {
    protected _value = 90
    // personMarker = nr<HTMLCanvasElement>("canvas",{class: "personMarker"})
    angleValPairs: [string,number][] = [
        ["⇖",135],
        ["⇑",90],
        ["⇗",45],
        ["⇚",180],
        ["⇒",0],
        ["⇙",225],
        ["⇓",270],
        ["⇘",315],
    ]
    constructor(){
        super("div",{class: "eightAngleSelect"})
        this.children.set(/*this.personMarker,*/...this.angleValPairs.map((pair,index) => {
            const newOpt = nr("div",{class: "angleIndex",style: `grid-area: angleIndex${index}`}, nr("p",{},pair[0]))
            newOpt.elem.onclick = () => {
                this.onOptionClicked(pair[1],newOpt)
            }
            return newOpt
        }))
        this.renderSelected()
        // this.drawPersonMarker()
    }
    get value(){
        return this._value
    }
    set value(val: number){
        this._value = val
        this.renderSelected()
        // this.drawPersonMarker()
    }
    // drawPersonMarker(){
    //     console.log(this._value)
    //     this._value//を基にpersonMarkerに描く
    //     const ctx = this.personMarker.elem.getContext("2d")
    //     if(ctx === null) return
    //     const Width = 240
    //     const Height = 240
    //     const center = new Point(Width/2,Height/2)
    //     this.personMarker.elem.width = Width
    //     this.personMarker.elem.height = Height
    //     ctx.clearRect(0,0,Width,Height)
        
    //     ctx.beginPath()
    //     ctx.fillStyle = massCanvasDef.personMarkerColors[0]
    //     ctx.arc(...center.getPair(),Width/2 * 0.6, 0 ,Math.PI*2)
    //     ctx.fill()

    //     const directionPoint = new Point(Width,Height/2).sub(center).toRevolved(this._value).add(center)
    //     ctx.beginPath()
    //     ctx.lineWidth = 24
    //     ctx.strokeStyle = massCanvasDef.personMarkerColors[0]
    //     ctx.moveTo(...center.getPair())
    //     ctx.lineTo(...directionPoint.getPair())
    //     ctx.stroke()

    // }
    renderSelected(){
        this.children.forEach(child => {
            child.elem.classList.remove("selected")
        })
        const index = this.angleValPairs.findIndex(v => v[1] === this._value)
        if(index === undefined) {
            this._value = 90
            this.renderSelected()
            return
        }
        this.children[index]?.elem.classList.add("selected")
    }
    onOptionClicked(val: number,option: Narve.Component){
        this._value = val
        this.renderSelected()
        // option.elem.classList.add("selected")
        // this.drawPersonMarker()
    }
}