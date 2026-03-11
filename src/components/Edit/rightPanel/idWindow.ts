import { Narve, nr } from "narve";
import Scene from "../../../global/Scene";
import { setNumKeyOperations } from "../../../global/ShortcutKey";

export default class IdWindow extends Narve.Component {
    idDisp = nr("p")
    checkIdBtn = nr("button",{},"1．番号確認")
    resetIdBtn = nr("button",{},"2．番号振り直し")
    targetSceneSelect = nr<HTMLSelectElement>("select",{})
    currentSceneIndex: number|undefined
    constructor(){
        super("div",{class: "idWindow"})
        this.children.set(this.idDisp,this.checkIdBtn,this.resetIdBtn,nr("p",{},"基準のシーン"),this.targetSceneSelect)

        this.resetIdBtn.elem.onclick = () => {
            this.onResetIdBtnClicked(this.getTargetScene()||0)
        }
    }
    onResetIdBtnClicked(targetSceneIndex: number){
        targetSceneIndex // define in project://src/components/Edit.ts
    }
    setId(id: number){
        this.idDisp.setInnerText(`id : ${id}`)
    }
    reloadScenesOption(scenes: Scene[]){
        this.targetSceneSelect.children.set(
            ...scenes.map((_,i) => nr("option",{value: i},`シーン${i+1}`))
        )
        if(this.currentSceneIndex !== undefined){
            this.targetSceneSelect.children[this.currentSceneIndex]?.setInnerText(`シーン${this.currentSceneIndex+1}(現在のシーン)`)
        }
    }
    onSceneIndexChanged(sceneIndex: number,scenes: Scene[]){
        // this is excused in project://src/App.ts > setScene
        this.currentSceneIndex = sceneIndex
        this.reloadScenesOption(scenes)
        this.targetSceneSelect.elem.selectedIndex = sceneIndex
    }
    getTargetScene(){
        const start = Number(this.targetSceneSelect.elem.value)
        if(Number.isNaN(start)) return null
        if(start < 0) return null
        return start
    }
    display(display?: string): void {
        super.display(display)
        this.onDisplay()
    }
    onDisplay(){
        setNumKeyOperations([
            undefined,
            this.checkIdBtn,
            this.resetIdBtn
        ].map(nar => nar?() => nar.elem.focus() : undefined))
    }
}