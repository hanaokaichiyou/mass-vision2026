import { Narve, nr } from "narve";
import Scene from "../global/Scene";
import SceneUnit from "./ScenePage/SceneUnit";
import "./styles/scenePage.css"
import SceneUnitDammy from "./ScenePage/SceneUnitDammy";
import { UndoFunc } from "../global/Undo";

export default class ScenePage extends Narve.Component {
    scenes: Scene[]
    header = nr("header",{},"←")
    sortBtn = nr("button",{},"並び替え")
    completeBtn = nr("button",{},"完了")
    buttonArea = nr("div",{},this.sortBtn,this.completeBtn)
    scenesElem = nr("div",{class: "scenesElem"})
    constructor(scenes: Scene[]){
        super("div",{class: "scenePage"})
        this.children.set(this.header,this.buttonArea,this.scenesElem)
        this.scenes = scenes
        this.reload()
        this.buttonArea.switchFocus(this.sortBtn)
        this.sortBtn.elem.onclick = () => this.startSort()
    }
    setScenes(scenes: Scene[]){
        this.scenes = scenes
    }
    reload(){
        this.scenesElem.children.set(...this.scenes.map(scene => {
            const sceneUnit = new SceneUnit(scene)
            sceneUnit.elem.onclick = () => {
                this.onSceneUnitClicked(scene)
            }
            return sceneUnit
        }))
    }
    
    reloadAsSort(){
        let movingSceneIndex: number|undefined
        const clearMoving = () => this.scenesElem.children.forEach(c => {
            c.elem.classList.remove("moving")
            c.elem.classList.remove("hovering")
        })
        this.scenesElem.children.set(...[...this.scenes,undefined].map((scene,index) => {
            const sceneUnit = scene !== undefined? new SceneUnit(scene) : new SceneUnitDammy()
            sceneUnit.elem.onclick = () => {}
            sceneUnit.elem.onmousedown = () => {
                sceneUnit.elem.classList.add("moving")
                movingSceneIndex = index
            }
            sceneUnit.elem.onmouseenter = e => {
                e.stopPropagation()
                if(movingSceneIndex !== undefined)
                    sceneUnit.elem.classList.add("hovering")
            }
            sceneUnit.elem.onmouseout = e => {
                e.stopPropagation()
                sceneUnit.elem.classList.remove("hovering")
            }
            sceneUnit.elem.onmouseup = e => {
                e.stopPropagation()
                if(movingSceneIndex !== undefined) this.insertSceneToSort(movingSceneIndex,index)
                movingSceneIndex = undefined
                clearMoving()
            }
            return sceneUnit
        }))
        // this.scenesElem.elem.onmouseenter = () => {
        //     if(movingSceneIndex !== undefined)
        //         this.scenesElem.children[this.scenesElem.children.length-1].elem.classList.add("hoveringRight")
        // }
        // this.scenesElem.elem.onmouseout = () => {
        //     this.scenesElem.children[this.scenesElem.children.length-1].elem.classList.remove("hoveringRight")
        // }
        // this.scenesElem.elem.onmouseup = () => {
        //     clearMoving()
        //     if(movingSceneIndex) this.insertScene(movingSceneIndex,this.scenesElem.children.length)
        //     movingSceneIndex = undefined
        // }
    }
    startSort(): Promise<void>{
        this.buttonArea.switchFocus(this.completeBtn)
        this.reloadAsSort()
        
        return new Promise(resolve => {
            this.completeBtn.elem.onclick = () => {
                this.buttonArea.switchFocus(this.sortBtn)
                this.reload()
                resolve()
            }
        })
    }
    insertSceneToSort(objIndex: number, insertIndex: number){
        const obj = this.scenes[objIndex]
        if(obj === undefined) return
        this.scenes.splice(objIndex,1)
        this.scenes.splice(insertIndex,0,obj)
        this.reloadAsSort()
        this.pushUndo({
            do: () => {
                this.scenes.splice(objIndex,1)
                this.scenes.splice(insertIndex,0,obj)
            },
            undo: () => {
                this.scenes.splice(insertIndex,1)
                this.scenes.splice(objIndex,0,obj)
            }
        })
        console.log(objIndex,"to",insertIndex)
    }
    onSceneUnitClicked(scene: Scene){
        scene//define in project://src/App.ts
    }
    pushUndo(...func: UndoFunc[]){
        func// define in project://src/App.ts
    }
}