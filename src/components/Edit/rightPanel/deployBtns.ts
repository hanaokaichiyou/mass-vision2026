import { Narve, nr } from "narve";
import "./style/deployBtns.css"
import SymmetryWindow from "./deployBtns/symmetryWindow";

// 人だけでなくリンクスライドの目的地編集にも使われる
export default class DeployBtns extends Narve.Component {
    pointBtn = nr<HTMLButtonElement>("button",{},"・")
    rectBtn = nr<HTMLButtonElement>("button",{},"□")
    circleBtn = nr<HTMLButtonElement>("button",{},"○")
    lineBtn = nr<HTMLButtonElement>("button",{},"／")
    distanceBtn = nr<HTMLButtonElement>("button",{},"⇔")
    removeBtn = nr("button",{},"🗑")
    recycleBtn = nr("button",{},"♲")
    alignBtn = nr("button",{},"整")
    symmetryBtn = nr("button",{},"対称")
    copyAndPaste = nr("button",{},"📋")
    cutAndPaste = nr("button",{},"✄")

    rootMenu = nr("div",{},this.pointBtn,this.rectBtn,this.circleBtn,this.lineBtn,this.distanceBtn,this.removeBtn,this.alignBtn,this.symmetryBtn,this.copyAndPaste,this.cutAndPaste)
    symmetryWindow = new SymmetryWindow()
    windows = nr("div",{},this.rootMenu,this.symmetryWindow)
    constructor(useRecycle?: boolean){
        super("div",{class: "deployBtnArea"})
        this.children.set(this.windows)
        if(useRecycle) this.rootMenu.children.push(this.recycleBtn)
        
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
}