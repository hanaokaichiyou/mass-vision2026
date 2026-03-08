import { Narve, nr } from "narve";

export default class SceneStateDisp extends Narve.Component {
    scene = nr("span")
    count = nr("span")
    constructor(){
        super("div",{class: "sceneStateDisp"})
        this.children.set(this.scene,this.count)
    }
    setSceneIndex(sceneNum: number){
        this.scene.setInnerText(`シーン : ${sceneNum+1}`)
    }
    setCountNum(countNum: number){
        this.count.setInnerText(`カウント : ${countNum}`)
    }
}