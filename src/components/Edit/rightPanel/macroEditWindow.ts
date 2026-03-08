import { Narve, nr } from "narve";
import Scene from "../../../global/Scene";
import "./style/macroEditWindow.css"
import Macro from "../../../global/Macro";
import { UndoFunc } from "../../../global/Undo";
import { massCanvasDef } from "../../../global/massCanvasDef";

export default class MacroEditWindow extends Narve.Component {
    macroIndexSelect = nr<HTMLSelectElement>("select")
    macroColorDiv = nr("div",{class: "macroColorDiv"})
    editBtn = nr("button",{},"編集")
    applyMacroBtn = nr("button",{},"マクロを適用")
    macroDisp = nr("p")
    addMacroBtn = nr("button",{},"+　マクロを追加")
    scene: Scene|undefined
    constructor(){
        super("div",{class: "macroEditWindow"})
        this.children.set(
            this.macroIndexSelect,
            this.macroColorDiv,
            this.macroDisp,this.editBtn,this.applyMacroBtn,
            this.addMacroBtn
        )
        this.applyMacroBtn.hide()
        this.macroDisp.hide()
        this.editBtn.hide()

        this.addMacroBtn.elem.onclick = () => this.addNewMacro()
        this.editBtn.elem.onclick = () => this.startEditMacro(this.macroIndexSelect.elem.selectedIndex)
        this.macroIndexSelect.elem.onchange = () => this.setMacroIndex(this.macroIndexSelect.elem.selectedIndex)
    }
    setScene(scene: Scene){
        this.scene = scene
        this.reloadSelect()
    }
    reloadSelect(){
        if(this.scene === undefined) this.macroIndexSelect.children.set()
        else
        this.macroIndexSelect.children.set(
            ...this.scene.macros.map((_,index) => 
                // Warning マクロ番号とマクロindexは異なる
                nr("option",{value: index},`マクロ${index+1}`)
            )
        )        
        this.applyMacroBtn.hide()
        this.macroDisp.hide()
        this.editBtn.hide()
        this.macroColorDiv.hide()
    }
    setMacroIndex(index: number){
        const macroStr = this.scene?.macros[index]?.macroStr
        if(macroStr === undefined) return
        this.drawMacro()
        this.macroIndexSelect.elem.selectedIndex = index
        this.macroDisp.setInnerText(macroStr||"未定義のマクロ")
        this.macroDisp.display()
        this.editBtn.display()
        this.applyMacroBtn.display()

        this.macroColorDiv.elem.style.backgroundColor = ""
            this.macroColorDiv.elem.style.borderWidth = "0px"
        if(index < massCanvasDef.macroMarkColors.length){
            this.macroColorDiv.elem.style.borderColor = massCanvasDef.macroMarkColors[index]
            this.macroColorDiv.elem.style.borderWidth = "2px"
            this.macroColorDiv.elem.style.borderStyle = "solid"
        }else if(index < massCanvasDef.macroMarkColors.length*2){
            this.macroColorDiv.elem.style.backgroundColor = massCanvasDef.macroMarkColors[index-massCanvasDef.macroMarkColors.length]
        }
    }
    async startEditMacro(index: number){
        if(this.scene === undefined) return
        const macro = this.scene.macros[index]
        if(macro === undefined) return

        this.macroDisp.hide()
        this.editBtn.hide()
        this.applyMacroBtn.hide()

        const beforeStr = this.scene.macros[index].macroStr
        const newStr 
            = this.scene.macros[index].macroStr 
            = await this.startInputMacro(this.scene.macros[index].macroStr)
        this.setMacroIndex(index)
        this.pushUndo({
            do: () => {
                if(this.scene === undefined) return
                this.scene.macros[index].macroStr = newStr
                this.setMacroIndex(index)
            },
            undo: () => {
            if(this.scene === undefined) return
                this.scene.macros[index].macroStr = beforeStr
                this.setMacroIndex(index)
            }
        })
    }
    async startInputMacro(defaultVal: string): Promise<string>{
        // defined in project://src/components/Edit.ts
        defaultVal
        return ""
    }
    addNewMacro(){
        if(this.scene === undefined) return
        this.scene.macros.push(new Macro())
        this.reloadSelect()
        const index = this.scene.macros.length-1
        this.setMacroIndex(index)
        this.startEditMacro(index)
        this.pushUndo({
            do: () => {
                if(this.scene === undefined) return
                this.scene.macros.push(new Macro())
                this.reloadSelect()
                const index = this.scene.macros.length-1
                this.setMacroIndex(index)
            },
            undo: () => {
                if(this.scene === undefined) return
                this.scene.macros.pop()
                this.reloadSelect()
                const index = this.scene.macros.length-1
                this.setMacroIndex(index)
            }
        })
    }
    drawMacro(){
        // define in project://src/components/Edit.ts
    }
    getFocusingMacroIndex(){
        return this.macroIndexSelect.elem.selectedIndex
    }
    pushUndo(...func: UndoFunc[]){
        func// define in project://src/App.ts
    }
}