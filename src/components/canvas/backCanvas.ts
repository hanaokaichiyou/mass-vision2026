import { massCanvasDef } from "../../global/massCanvasDef";
import Point from "../../global/Point";
import MassCanvas from "./massCanvas";

export default class BackCanvas extends MassCanvas {
    constructor(){
        super()
        this.fillBack()
    }
    drawGrid(){
        const cellSize = massCanvasDef.quarity
        this.drawMainGrid(
            cellSize,
            new Point(cellSize,cellSize),
            (massCanvasDef.gridRowsNum-1)*3,
            (massCanvasDef.gridColsNum-1)*3,
            massCanvasDef.exGridColor
        )
        this.drawMainGrid(
            cellSize,
            new Point(
                massCanvasDef.gridColsNum*cellSize,
                massCanvasDef.gridRowsNum*cellSize
            ),
            massCanvasDef.gridRowsNum-1,
            massCanvasDef.gridColsNum-1,
            massCanvasDef.centerGridColor
        )
        this.drawSupGrid(cellSize)
        
    }
    // 基本グリッド(点線)
    protected drawMainGrid(cellSize: number,startPoint: Point,rowCellsNum: number,colCellsNum: number,color: string){
        if(this.ctx === null) return
        this.ctx.strokeStyle = color
        this.ctx.beginPath()
        this.ctx.lineWidth = 2
        this.ctx.setLineDash([2,1])
        // 横線
        for(let r = 0;r <= rowCellsNum;r++){
            this.ctx.moveTo(...startPoint.add([0,cellSize*r]).getPair())
            this.ctx.lineTo(...startPoint.add([cellSize*colCellsNum,cellSize*r]).getPair())
        }
        // 縦線
        for(let c = 0;c <= colCellsNum;c++){
            this.ctx.moveTo(...startPoint.add([cellSize*c,0]).getPair())
            this.ctx.lineTo(...startPoint.add([cellSize*c,cellSize*rowCellsNum]).getPair())
        }
        this.ctx.stroke()
    }
    // 補助グリッド(実線)
    protected drawSupGrid(cellSize: number){
        if(this.ctx === null) return
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
    }
    fillBack(){
        if(this.ctx === null) return
        this.ctx.beginPath()
        this.ctx.fillStyle = massCanvasDef.backGroundColor
        this.ctx.fillRect(0,0,this.Width,this.Height)
    }
}