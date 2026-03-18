import { Narve, nr } from "narve";
import MassBar from "./timeLine/massBar";
import "./style/timeLine.css"
import SlowBar from "./timeLine/slowBar";
import MusicBar from "./timeLine/musicBar";
import Scene from "../../../global/Scene";

export type StartCounts = {
    massStartCount: number
    musicStartCount: number
}
export default class TimeLine extends Narve.Component {
    protected _startCounts: StartCounts = {
        massStartCount: 0,
        musicStartCount: 0
    }
    slowBar = new SlowBar(this)
    massBar = new MassBar(this)
    musicBar = new MusicBar(this)

    slowTitle = nr("p",{class: "slowTitle"},"スロー")
    massTitle = nr("p",{class: "massTitle"},"カウント")
    musicTitle = nr("p",{class: "musicTitle"},"音楽")

    isStartCountEditable = false
    constructor(){
        super("div",{class: "timeLine"})
        this.children.set(this.slowTitle,this.massTitle,this.musicTitle,this.slowBar,this.massBar,this.musicBar)

        this.massBar.onMassStartCountChanged = massStartCount => {
            const tempStartCounts = {
                ...this.startCounts,
                massStartCount: massStartCount
            }
            this.slowBar.reload(tempStartCounts)
            this.massBar.reload(tempStartCounts)
            this.musicBar.reload(tempStartCounts)
        }
    }
    get startCounts(){
        if(this.isStartCountEditable) return this._startCounts
        else return {
            massStartCount: 0,
            musicStartCount: 0
        }
    }
    set startCounts(startCounts: StartCounts){
        this._startCounts = {...startCounts}
        this.slowBar.reload(this._startCounts)
        this.massBar.reload(this._startCounts)
        this.musicBar.reload(this._startCounts)
    }
    loadScene(scene: Scene,sceneIndex: number){
        const maxCount = Math.max(0,...scene.persons.map(person => {
            if(person.macroIndex === undefined) return 0
            const macro = scene.macros[person.macroIndex]
            if(macro === undefined) return 0
            return macro.totalCount(person.variables)
        }))
        
        this.isStartCountEditable = sceneIndex === 0
        this.massBar.loadScene(maxCount)
        this.slowBar.loadScene(maxCount,scene.slowSegments)
        this.musicBar.loadScene(maxCount)
    }
}