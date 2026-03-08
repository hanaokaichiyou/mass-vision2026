import { Narve, nr } from "narve";
import { massCanvasDef } from "../../../global/massCanvasDef";
import "./style/pamphSettings.css"

export default class PamphSettings extends Narve.Component {
    checkBoxes: PamphDispCheckBox[] = []
    constructor(){
        super("div",{class: "pamphSettings"})
        this.children.set(
            ...massCanvasDef.personMarkerColors.map((color,i) => {
                const checkBox = new PamphDispCheckBox(color)
                this.checkBoxes.push(checkBox)
                return nr("p",{},
                    checkBox,
                    nr("div",{},massCanvasDef.personMarkerColorNames[i])
                )
            })
        )
    }
    get checkeds(){
        return this.checkBoxes.map(checkbox => checkbox.checked)
    }
    set checkeds(checkeds: boolean[]){
        console.log("checkeds",checkeds)
        checkeds.forEach((checked,i) => {
            if(this.checkBoxes[i] !== undefined){
                this.checkBoxes[i].checked = checked
            }
        })
    }
}
class PamphDispCheckBox extends Narve.Component {
    protected _checked = false
    protected color
    constructor(color: string){
        super("div",{class: "pamphDispCheckBox"})
        this.elem.onclick = () => this.toggle()
        this.elem.style.borderColor = color
        this.color = color
    }
    set checked(checked: boolean){
        this._checked = checked
        if(this._checked){
            this.elem.classList.add("checked")
            this.elem.style.backgroundColor = this.color
        }else{
            this.elem.classList.remove("checked")
            this.elem.style.backgroundColor = ""
        }
    }
    get checked(){
        return this._checked
    }
    toggle(){
        this.checked = !this.checked
    }
}
