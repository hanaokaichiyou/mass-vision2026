import { Narve, nr } from "narve";
import "./style/macroInput.css"

export default class MacroInput extends Narve.Component {
macroInput = nr<HTMLInputElement>("input",{type: "text", placeholder: "マクロを入力(Enterで完了)"})
    constructor(){
        super("div",{class: "macroInput"})
        this.children.set(this.macroInput)
    }
    startInputMacro(defaultVal: string): Promise<string>{
        this.macroInput.elem.value = defaultVal
        this.macroInput.elem.focus()
        return new Promise(resolve => {
            this.macroInput.elem.onkeydown = e => {
                if(e.key === "Enter"){
                    resolve(this.macroInput.elem.value)
                }
            }
            const bracketsOpen = "({[<".split("")
            const bracketsClose = ")}]>".split("")
            this.macroInput.elem.onkeyup = e => {
                const bracketsIdx = bracketsOpen.findIndex(v => v === e.key)
                if(bracketsIdx !== -1){
                    const cursorPos = this.macroInput.elem.selectionStart
                    const text = this.macroInput.elem.value
                    if(cursorPos !== null){
                        this.macroInput.elem.value = text.substring(0,cursorPos) + bracketsClose[bracketsIdx] + text.substring(cursorPos)
                        this.macroInput.elem.selectionStart = 
                        this.macroInput.elem.selectionEnd = cursorPos
                    }
                }
            }
        })
    }
}