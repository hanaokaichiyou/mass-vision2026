import { Narve } from "narve";
import SceneStateDisp from "./topPanel/sceneStateDisp";
import "./style/topPanel.css"

export default class TopPanel extends Narve.Component {
    sceneStateDisp = new SceneStateDisp()
    constructor(){
        super("div",{class: "topPanel"})
        this.children.set(this.sceneStateDisp)
    }
    setScene(sceneIndex: number){
        this.sceneStateDisp.setSceneIndex(sceneIndex)
        this.sceneStateDisp.setCountNum(0)
    }
}