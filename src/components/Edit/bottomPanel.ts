import { Narve } from "narve";
import MacroInput from "./bottomPanel/macroInput";
import TimeLine from "./bottomPanel/timeLine";
import Scene from "../../global/Scene";
import "./style/bottomPanel.css"

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
        this.switchFocus(this.timeLine,"flex")
        return newMacro
    }
    setScene(scene: Scene,sceneIndex: number){
        if(scene.persons.length >= 1){
            this.timeLine.loadScene(scene,sceneIndex)
        }
    }
}