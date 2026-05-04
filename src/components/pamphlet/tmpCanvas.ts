import { Narve } from "narve"
import { massCanvasDef } from "../../global/massCanvasDef"
import Point from "../../global/Point"
import { frame, sceneFrames } from "../../global/Frames"
import Person from "../../global/Person"
import PointDiff from "../../global/PointDiff"


export default class TmpCanvas extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null
    Width: number = 0
    Height: number = 0

    adjustDiff = new PointDiff(
        massCanvasDef.quarity*(3-massCanvasDef.gridColsNum),
        massCanvasDef.quarity*(3-massCanvasDef.gridRowsNum)
    )
    constructor(){
        super("canvas",{class: "gridCanvas"})
        this.Width = massCanvasDef.quarity*(massCanvasDef.gridColsNum+5)
        this.Height = massCanvasDef.quarity*(massCanvasDef.gridRowsNum+5)
        this.elem.width = this.Width
        this.elem.height = this.Height
        this.ctx = this.elem.getContext("2d")
    }
    drawFrame(frame: frame,sceneFrames: sceneFrames,focusedPerson: Person,colorFills?: boolean[]){
        this.clearAll()
        this.drawGrid()
        this.drawTrace(sceneFrames,focusedPerson)
        frame.statePersonPairs.forEach(({state,person}) => {
            this.plot(state.pos.add(this.adjustDiff),
                state.rotateAngle,
                person === focusedPerson,
                colorFills?.[person.colorIndex]
            )
        })
    }
    plot(pos: Point|undefined,spinAngle: number|undefined,focused: boolean,colorFill?: boolean){
        if(this.ctx === null) return
        if(pos === undefined) return
        const r = massCanvasDef.personMarkerR

        this.ctx.beginPath()
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = focused? "#000" : "#777"
        this.ctx.fillStyle = colorFill? this.ctx.strokeStyle : "#fff"
        if(spinAngle !== undefined){
            this.ctx.moveTo(...pos.getPair())
            this.ctx.lineTo(...pos.add([r*2,0]).toRevolved(spinAngle,pos).getPair())
        }
        this.ctx.stroke()

        this.ctx.moveTo(...pos.getPair())
        this.ctx.arc(pos.x,pos.y,r,0,2*Math.PI)
        this.ctx.lineWidth = 4
        this.ctx.stroke()
        this.ctx.fill()
        // if(focused){
        //     this.ctx.beginPath()
        //     this.ctx.strokeStyle = massCanvasDef.pamphFocusColor
        //     this.ctx.lineWidth = 2
        //     this.ctx.rect(...pos.add([-1.5*r,-1.5*r]).getPair(),3*r,3*r)
        //     this.ctx.stroke()
        // }
    }
    drawGrid(rowsNum: number = massCanvasDef.gridRowsNum, colsNum: number = massCanvasDef.gridColsNum){
        if(this.ctx === null) return
        this.ctx.strokeStyle = massCanvasDef.pamphGridColor
        // セルは正方形なので縦横同じ
        const cellSize = massCanvasDef.quarity
        // 基本グリッド
            this.ctx.beginPath()
            this.ctx.lineWidth = 2
            this.ctx.setLineDash([2,1])
            // 横線
            const startPoint = new Point(cellSize * 3,cellSize * 3)
            for(let r = 0;r < rowsNum;r++){
                this.ctx.moveTo(...startPoint.add([0,cellSize*r]).getPair())
                this.ctx.lineTo(...startPoint.add([cellSize*(colsNum-1),cellSize*r]).getPair())
            }
            // 縦線
            for(let c = 0;c < colsNum;c++){
                this.ctx.moveTo(...startPoint.add([cellSize*c,0]).getPair())
                this.ctx.lineTo(...startPoint.add([cellSize*c,cellSize*(rowsNum-1)]).getPair())
            }
            this.ctx.stroke()

        // 補助グリッド
            this.ctx.beginPath()
            this.ctx.lineWidth = 3
            this.ctx.setLineDash([1,0])
            const centerX = this.Width/2;
            const centerY = this.Height/2;
            const w1 = massCanvasDef.supGridWidth1*cellSize
            const w2 = massCanvasDef.supGridWidth2*cellSize
            this.ctx.rect(centerX-w1/2,centerY-w1/2,w1,w1)
            this.ctx.rect(centerX-w2/2,centerY-w2/2,w2,w2)
            // クロス線も
            const wCross = (Math.min(massCanvasDef.gridRowsNum,massCanvasDef.gridColsNum)-1) * cellSize
            this.ctx.moveTo(centerX-wCross/2,centerY-wCross/2)
            this.ctx.lineTo(centerX+wCross/2,centerY+wCross/2)
            
            this.ctx.moveTo(centerX+wCross/2,centerY-wCross/2)
            this.ctx.lineTo(centerX-wCross/2,centerY+wCross/2)

            this.ctx.stroke()
        
        // 目盛り
            //縦の目盛り
            this.ctx.font = `bold ${cellSize/2}px sans-serif`
            this.ctx.textBaseline = "middle"
            this.ctx.textAlign = "center"
            this.ctx.beginPath()
            let scale_dY = 0
            while(scale_dY*2 < massCanvasDef.gridRowsNum){
                this.ctx.moveTo(2*cellSize,centerY + scale_dY*cellSize)
                this.ctx.lineTo(3*cellSize,centerY + scale_dY*cellSize)
                this.ctx.fillText(`${scale_dY}`,cellSize,centerY + scale_dY*cellSize)

                this.ctx.moveTo(this.Width - 2*cellSize,centerY + scale_dY*cellSize)
                this.ctx.lineTo(this.Width - 3*cellSize,centerY + scale_dY*cellSize)
                this.ctx.fillText(`${scale_dY}`,this.Width - cellSize,centerY + scale_dY*cellSize)


                this.ctx.moveTo(2*cellSize,centerY - scale_dY*cellSize)
                this.ctx.lineTo(3*cellSize,centerY - scale_dY*cellSize)
                this.ctx.fillText(`${scale_dY}`,cellSize,centerY - scale_dY*cellSize)
                
                this.ctx.moveTo(this.Width - 2*cellSize,centerY - scale_dY*cellSize)
                this.ctx.lineTo(this.Width - 3*cellSize,centerY - scale_dY*cellSize)
                this.ctx.fillText(`${scale_dY}`,this.Width - cellSize,centerY - scale_dY*cellSize)
                scale_dY += 5
            }

            // 横の目盛り

            let scale_dX = 0
            while(scale_dX*2 < massCanvasDef.gridColsNum){
                this.ctx.moveTo(centerX + scale_dX*cellSize, 2*cellSize)
                this.ctx.lineTo(centerX + scale_dX*cellSize, 3*cellSize)
                this.ctx.fillText(`${scale_dX}`,centerX + scale_dX*cellSize, cellSize)

                this.ctx.moveTo(centerX + scale_dX*cellSize, this.Height - 2*cellSize)
                this.ctx.lineTo(centerX + scale_dX*cellSize, this.Height - 3*cellSize)
                this.ctx.fillText(`${scale_dX}`,centerX + scale_dX*cellSize, this.Height - cellSize)


                this.ctx.moveTo(centerX - scale_dX*cellSize, 2*cellSize)
                this.ctx.lineTo(centerX - scale_dX*cellSize, 3*cellSize)
                this.ctx.fillText(`${scale_dX}`,centerX - scale_dX*cellSize, cellSize)
                
                this.ctx.moveTo(centerX - scale_dX*cellSize, this.Height - 2*cellSize)
                this.ctx.lineTo(centerX - scale_dX*cellSize, this.Height - 3*cellSize)
                this.ctx.fillText(`${scale_dX}`,centerX - scale_dX*cellSize, this.Height - cellSize)
                scale_dX += 5
            }
            this.ctx.stroke()
    }
    drawTrace(sceneFrames: sceneFrames,focusedPerson: Person){
        const personalStates = sceneFrames.map(frame => {
            return frame.statePersonPairs.find(({person}) => person === focusedPerson)
        })
        if(!personalStates.every(v => v !== undefined)) return
        personalStates.forEach(({state},i) => {
            if(this.ctx === null) return
            if(i){
                this.ctx.beginPath()
                this.ctx.lineWidth   = massCanvasDef.pamphTraceWidth
                this.ctx.strokeStyle = massCanvasDef.pamphTraceColor
                this.ctx.moveTo(...personalStates[i-1].state.pos.add(this.adjustDiff).getPair())
                this.ctx.lineTo(...state.pos.add(this.adjustDiff).getPair())
                this.ctx.stroke()
            }
        })
    }
    clearAll(){
        this.ctx?.clearRect(0,0,this.Width,this.Height)
    }
}