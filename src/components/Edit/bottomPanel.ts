import { Narve, nr } from "narve";
import MacroInput from "./bottomPanel/macroInput";

export default class BottomPanel extends Narve.Component {
    macroInput = new MacroInput()
    constructor(){
        super("div",{class: "bottomPanel"})
        this.children.set(this.macroInput)
        this.switchFocus(nr())
    }
    async startInputMacro(defaultval: string){
        this.switchFocus(this.macroInput)
        const newMacro = await this.macroInput.startInputMacro(defaultval)
        this.switchFocus(nr())
        return newMacro
    }
}