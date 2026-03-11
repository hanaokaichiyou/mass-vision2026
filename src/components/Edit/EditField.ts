import { Narve, nr } from "narve";
import BackCanvas from "../canvas/backCanvas";
import PersonsCanvas from "../canvas/personsCanvas";
import UICanvas from "../canvas/UICanvas";

export default class EditField extends Narve.Component {
    backCanvas = new BackCanvas()
    personsCanvas = new PersonsCanvas()
    uiCanvas = new UICanvas()

    fixed = false
    layer: Narve.Component
    constructor(){
        super("div",{class: "editField"})
        this.layer = nr("div",{class: "canvasLayer"},this.backCanvas,this.personsCanvas,this.uiCanvas)
        this.children.set(this.layer)
        this.backCanvas.drawGrid()        
    }
    fixLayerCenter(){
        const centerX = this.backCanvas.elem.getBoundingClientRect().width/2
        const centerY = this.backCanvas.elem.getBoundingClientRect().height/2
        const thisCenterX = this.elem.getBoundingClientRect().width/2
        const thisCenterY = this.elem.getBoundingClientRect().height/2
        const leftAbs = centerX-thisCenterX
        const topAbs = centerY-thisCenterY
        this.elem.scrollTo(leftAbs,topAbs)
        this.fixLayer()
    }
    fixLayer(){
        this.elem.style.overflow = "hidden"
        this.fixed = true
    }
    unFixLayer(){
        this.elem.style.overflow = "scroll"
        this.fixed = false
    }
}