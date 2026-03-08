import { Narve, nr } from "narve";
import { massCanvasDef } from "../../../global/massCanvasDef";

export default class SetColorIndexWindow extends Narve.Component {
    colorIndexSelect = nr<HTMLSelectElement>("select")
    applyBtn = nr("button",{},"色を適用")
    constructor(){
        super()
        this.children.set(this.colorIndexSelect,this.applyBtn)
        this.reloadSelect()
    }
    reloadSelect(){
        this.colorIndexSelect.children.set(...massCanvasDef.personMarkerColorNames.map(colorName => 
            nr("option",{},colorName)
        ))
    }
    getColorIndex(){
        return this.colorIndexSelect.elem.selectedIndex
    }
}