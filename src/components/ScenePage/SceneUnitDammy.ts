import { Narve } from "narve";
import { massCanvasDef } from "../../global/massCanvasDef";

export default class SceneUnitDammy extends Narve.Component{
    constructor(){
        super("div",{class: "sceneUnit"})
        this.elem.style.width = massCanvasDef.scenePageQuarity*(massCanvasDef.gridColsNum+1) + "px"
        this.elem.style.height = massCanvasDef.scenePageQuarity*(massCanvasDef.gridRowsNum+1) + "px"
    }
}