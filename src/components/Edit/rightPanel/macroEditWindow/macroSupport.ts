import { Narve, nr } from "narve";
import "./style/macroSupport.css"

export default class MacroSupport extends Narve.Component {
    supportMacroTexts = [
        "f{$n$}[$ct$]",
        "b<$comment$>[$ct$]",
        "t|r,l||,h|{$ang$}[$ct$]",
        "t|,h|{$ang$}[$ct$]",
        "s<$comment$>{$n$}[$ct$]",
        "dc<$comment$>[$ct$]",
    ]
    constructor(){
        super("div",{class: "macroSupports"})
        this.children.set(
            ...this.supportMacroTexts.map(text => 
                this.createSupport(text)
            )
        )
    }
    onEnter(insertText: string){
        insertText
    }

    protected createSupport(supportMacroText: string){
        const support = nr("div",{class: "macroSupport"})
        const getTexts = supportMacroText.split("$").map((text,i) => {
            if(i % 2 == 0){
                const getTexts = text.split("|").map((text,j) => {
                    if(j % 2 == 0){
                        const span = nr("span",{},text)
                        support.children.push(span)
                        return () => text
                    }else{
                        const select = nr<HTMLSelectElement>("select",{},
                            ...text.split(",").map(op => nr("option",{},op))
                        )
                        support.children.push(select)
                        return () => {
                            return select.elem.value
                        }
                    }
                })
                return ()=> {
                    return getTexts.map(f => f()).join("")
                }
            }else{
                const input = nr<HTMLInputElement>("input",{type: "text", placeholder: text, style: `min-width: ${text.length * 0.5}em;width: 0px`})
                input.elem.oninput = () => {
                    input.elem.style.width = `${input.elem.value.length * 0.5}em`
                }
                support.children.push(input)
                return () => {
                    return input.elem.value
                }
            }
        })
        const okBtn = nr("button",{},"✅")
        okBtn.elem.onclick = () => {
            this.onEnter(getTexts.map(f => f()).join(""))
        }
        support.children.push(okBtn)
        return support
    }
}