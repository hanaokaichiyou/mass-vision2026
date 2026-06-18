import { Narve, nr } from "narve";
import "./style/deployBtns.css"
import SymmetryWindow from "./deployBtns/symmetryWindow";
import { setNumKeyOperations } from "../../../global/ShortcutKey";

// 人だけでなくリンクスライドの目的地編集にも使われる
export default class DeployBtns extends Narve.Component {
    pointBtn = nr<HTMLButtonElement>("button",{},"・(1)")
    rectBtn = nr<HTMLButtonElement>("button",{},"▢(2)")
    circleBtn = nr<HTMLButtonElement>("button",{},"〇(3)")
    lineBtn = nr<HTMLButtonElement>("button",{},"／(4)")
    distanceBtn = nr<HTMLButtonElement>("button",{},"⇔(5)")
    removeBtn = nr("button",{},"🗑(6)")
    recycleBtn = nr("button",{},"♲(7)")
    alignBtn = nr("button",{},"整(8)")
    symmetryBtn = nr("button",{},"対称(9)")
    copyAndPaste = nr("button",{},"📋")
    cutAndPaste = nr("button",{},"✄")

    rootMenu = nr("div",{},this.pointBtn,this.rectBtn,this.circleBtn,this.lineBtn,this.distanceBtn,this.removeBtn,this.alignBtn,this.symmetryBtn,this.copyAndPaste,this.cutAndPaste)
    symmetryWindow = new SymmetryWindow()
    windows = nr("div",{},this.rootMenu,this.symmetryWindow)
    constructor(useRecycle?: boolean){
        super("div",{class: "deployBtnArea"})
        this.children.set(this.windows)
        // Warning ボタンの数を変えると、6に挿入ではうまくいかなくなる
        if(useRecycle) this.rootMenu.children.insert(6,this.recycleBtn)
        
        this.symmetryBtn.elem.onclick = () => {
            this.windows.switchFocus(this.symmetryWindow)
        }
        this.symmetryWindow.elem.oncontextmenu = e => {
            e.stopPropagation()
            e.preventDefault()
            this.windows.switchFocus(this.rootMenu)
        }
        this.windows.switchFocus(this.rootMenu)
    }
    display(display?: string): void {
        super.display(display)
        this.onDisplay()
    }
    onDisplay(){
        setNumKeyOperations([
            undefined,
            this.pointBtn,
            this.rectBtn,
            this.circleBtn,
            this.lineBtn,
            this.distanceBtn,
            this.removeBtn,
            this.recycleBtn,
            this.alignBtn,
            this.symmetryBtn,
            this.copyAndPaste,
            this.cutAndPaste
        ].map(nar => nar?() => nar.elem.focus() : undefined))
    }
}