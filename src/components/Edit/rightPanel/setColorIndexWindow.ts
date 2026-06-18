import { Narve, nr } from "narve";
import { massCanvasDef } from "../../../global/massCanvasDef";

export default class SetColorIndexWindow extends Narve.Component {
    colorIndexSelect = nr<HTMLSelectElement>("select")
    constructor(){
        super()
        this.children.set(this.colorIndexSelect)
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
    display(display?: string): void {
        super.display(display)
        this.onDisplay()
    }
    onDisplay(){

    }
}