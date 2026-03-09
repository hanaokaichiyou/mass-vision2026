import { Narve, nr } from "narve";
import MacroInput from "./bottomPanel/macroInput";
import TimeLine from "./bottomPanel/timeLine";
import Scene from "../../global/Scene";

export default class BottomPanel extends Narve.Component {
    macroInput = new MacroInput()
    timeLine = new TimeLine()
    constructor(){
        super("div",{class: "bottomPanel"})
        this.children.set(this.macroInput,this.timeLine)
        this.switchFocus(this.timeLine,"flex")
    }
    async startInputMacro(defaultval: string){
        this.switchFocus(this.macroInput)
        const newMacro = await this.macroInput.startInputMacro(defaultval)
        this.switchFocus(nr())
        return newMacro
    }
    setScene(scene: Scene){
        if(scene.persons.length >= 1){
            const maxCount = Math.max(0,...scene.persons.map(person => {
                if(person.macroIndex === undefined) return 0
                const macro = scene.macros[person.macroIndex]
                if(macro === undefined) return 0
                return macro.totalCount(person.variables)
            }))
            this.timeLine.massBar.startScene(maxCount)
            this.timeLine.slowBar.startScene(maxCount,scene.slowSegments)
        }
    }
}