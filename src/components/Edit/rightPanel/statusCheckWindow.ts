import { Narve, nr } from "narve";
import Person from "../../../global/Person";
import { px2coordinates } from "../../../global/coordinate";
import RightPanel from "../rightPanel";
import Scene from "../../../global/Scene";

export default class StatusCheckWindow extends Narve.Component {
    startPosDisp = nr("p")
    startAngleDisp = nr("p")
    idDisp = nr("p")
    reverseFlagDisp = nr("p")
    macroNoDisp = nr("p")
    macroDisp = nr("p")
    varsDisp = nr("table")
    parent: RightPanel
    constructor(parent: RightPanel){
        super("div",{class: "statusCheckWindow"})
        this.parent = parent
        this.children.set(
            this.startPosDisp,
            this.startAngleDisp,
            this.idDisp,
            this.reverseFlagDisp,
            this.macroNoDisp,
            this.macroDisp,
            this.varsDisp,
        )
    }
    showStatus(scene: Scene,person: Person){
        const coo = px2coordinates(person.startState.pos)
        this.startPosDisp.setInnerText(`初期位置 (${coo[0]},${coo[1]})`)
        this.startAngleDisp.setInnerText(`初期方向 ${person.startState.rotateAngle}`)
        this.idDisp.setInnerText(`番号 ${person.id}`)
        this.reverseFlagDisp.setInnerText(`ダッシュ ${person.reverseFlag?"ON":"OFF"}`)
        this.macroNoDisp.setInnerText(`マクロ番号 ${person.macroIndex !== undefined? person.macroIndex+1 : "---"}`)
        this.macroDisp.setInnerText(`マクロ ${person.macroIndex !== undefined? scene.macros[person.macroIndex]?.macroStr : "---"}`)
        this.varsDisp.children.set(
            nr("tr",{}, nr("th",{},"変数")),
            ...Object.entries(person.variables).map(([key,val]) => 
                nr("tr",{}, nr("td",{},key), nr("td",{},val.toString()))
            )
        )
    }
    clear(){
        this.startPosDisp.setInnerText("")
        this.startAngleDisp.setInnerText("")
        this.idDisp.setInnerText("")
        this.reverseFlagDisp.setInnerText("")
        this.macroNoDisp.setInnerText("")
        this.macroDisp.setInnerText("")
        this.varsDisp.children.set()
    }
    display(display?: string): void {
        super.display(display)
        this.onDisplay()
    }
    hide(): void {
        super.hide()
        this.onHide()
    }
    async onDisplay(){
        this.clear()
        while(true){
            const point = await this.parent.parent.editField.uiCanvas.getPoint()
            this.parent.parent.editField.uiCanvas.clearAll()
            if(point === null) break
            const [person,_] = this.parent.parent.nearestPerson(point)
            if(person === undefined) break
            this.parent.parent.editField.uiCanvas.drawSelect(person.startState.pos)
            this.showStatus(this.parent.parent.scene,person)
            console.log(person)
        }
    }
    onHide(){
        this.parent.parent.editField.uiCanvas.cancel()
        this.parent.parent.editField.uiCanvas.clearAll()
    }
}