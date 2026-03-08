import { Narve, nr } from "narve";
import "./style/macroInput.css"

export default class MacroInput extends Narve.Component {
macroInput = nr<HTMLInputElement>("input",{type: "text", placeholder: "マクロを入力(Enterで完了)"})
    constructor(){
        super("div",{class: "macroInput"})
        this.children.set(this.macroInput)
    }
    startInputMacro(defaultVal: string): Promise<string>{
        console.log("powww")
        this.macroInput.elem.value = defaultVal
        this.macroInput.elem.focus()
        return new Promise(resolve => {
            this.macroInput.elem.onkeydown = e => {
                if(e.key === "Enter"){
                    resolve(this.macroInput.elem.value)
                }
            }
        })
    }
}