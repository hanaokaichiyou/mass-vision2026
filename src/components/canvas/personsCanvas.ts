import { massCanvasDef } from "../../global/massCanvasDef";
import { frame } from "../../global/Frames";
import MassCanvas from "./massCanvas";
import { countState } from "../../global/count";
import PersonState from "../../global/PersonState";
import { massCanvasDef as ms } from "../../global/massCanvasDef";

export default class PersonsCanvas extends MassCanvas {
    playingInterval: NodeJS.Timeout|null = null
    constructor(){
        super()
    }
    
    plot(state: PersonState,colorIndex: number,dispNumber?: number|undefined,isLarge?: boolean){
        if(this.ctx === null) return
        const r = isLarge? ms.largePersonMarkerR : ms.personMarkerR

        this.ctx.beginPath()
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = massCanvasDef.personMarkerColors[colorIndex]||"#fff"
        this.ctx.fillStyle = massCanvasDef.personMarkerColors[colorIndex]||"#fff"
        if(state.rotateAngle !== undefined){
            this.ctx.moveTo(...state.pos.getPair())
            this.ctx.lineTo(...state.pos.add([r*2,0]).toRevolved(state.rotateAngle,state.pos).getPair())
        }
        this.ctx.stroke()
        this.ctx.moveTo(...state.pos.getPair())
        this.ctx.arc(...state.pos.getPair(),r,0,2*Math.PI)
        this.ctx.fill()
        if(dispNumber !== undefined){
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.font = `${this.quarity / 3}px sans-serif`
            this.ctx.fillStyle = "#000"
            this.ctx.fillText(dispNumber.toString(),...state.pos.getPair())
        }
    }
    plotAll(){
        
    }
    drawFrame(frame: frame, idMode: IdMode, varName?: ms.VariableName){
        this.clearAll()
        frame.statePersonPairs.forEach(({state,person}) => {
            person.state = state.clone()
            this.plot(
                state,
                person.colorIndex,
                idMode === "id" ? person.id :
                idMode === "var"? person.variables[varName||"g"] :
                person.macroIndex === undefined? undefined :
                person.macroIndex + 1 
            )
        })
    }
    
    /**
     * 
     * @param countState これのsceneIndexはfromSceneを0としたindex
     */
    onCountChanged = (countState: countState) => {
        // define in edit
        countState
    }
}

export type IdMode = "id"|"macro"|"var"