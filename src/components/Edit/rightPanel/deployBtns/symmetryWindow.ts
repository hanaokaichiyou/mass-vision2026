import { Narve, nr } from "narve";

export default class SymmetryWindow extends Narve.Component {
    xBtn = nr("button",{},"x軸対称")
    yBtn = nr("button",{},"y軸対称")
    oBtn = nr("button",{},"原点対称")
    sym45Btn = nr("button",{},"45°-225°対称")
    sym135Btn = nr("button",{},"135°-315°対称")
    R90Btn = nr("button",{},"R90度回転")
    L90Btn = nr("button",{},"L90度回転")

    constructor(){
        super("div",{class: "symmetryWindow"})

        this.children.set(this.xBtn,this.yBtn,this.sym45Btn,this.sym135Btn,this.oBtn,this.R90Btn,this.L90Btn)
        this.xBtn.elem.onclick = () => this.onSymmetryLineClicked(0,"x軸対称")
        this.yBtn.elem.onclick = () => this.onSymmetryLineClicked(90,"y軸対称")
        // 座標系がy軸逆
        this.sym45Btn.elem.onclick = () => this.onSymmetryLineClicked(135,"45°-225°対称")
        this.sym135Btn.elem.onclick = () => this.onSymmetryLineClicked(45,"135°-315°対称")
    }
    onSymmetryLineClicked(theta: number,mode: string){
        theta;mode// define in project://src/components/Edit.ts
    }
}