import { Narve, nr } from "narve";
import { massCanvasDef } from "../../global/massCanvasDef";
import Point from "../../global/Point";
import PersonState from "../../global/PersonState";
import Scene from "../../global/Scene";
import PointDiff from "../../global/PointDiff";

export default class SceneUnit extends Narve.Component {
    canvas = nr<HTMLCanvasElement>("canvas")
    ctx = this.canvas.elem.getContext("2d")
    
    Width: number = 0
    Height: number = 0
    quarity = massCanvasDef.scenePageQuarity

    scene: Scene
    constructor(scene: Scene){
        super("div",{class: "sceneUnit"})
        this.children.set(this.canvas)
        this.Width = this.quarity*(massCanvasDef.gridColsNum+1)
        this.Height = this.quarity*(massCanvasDef.gridRowsNum+1)

        this.canvas.elem.width = this.Width
        this.canvas.elem.height = this.Height

        this.scene = scene
        this.drawScene(scene)
    }
    drawScene(scene: Scene){
        if(this.ctx === null) return
        this.clearAll()
        this.drawGrid()
        scene.persons.forEach(person => {
            this.plot(person.startState,person.colorIndex)
        })
    }
    plot(state: PersonState,colorIndex: number){
        if(this.ctx === null) return
        const r = massCanvasDef.scenePagePersonMarkerR

        this.ctx.beginPath()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = massCanvasDef.personMarkerColors[colorIndex]||"#fff"
        this.ctx.fillStyle = massCanvasDef.personMarkerColors[colorIndex]||"#fff"

        // person.startState.posの原点が違うのでこれ分足す
        const diffForStart = new PointDiff(
            massCanvasDef.gridColsNum-1,
            massCanvasDef.gridRowsNum-1
        ).mul(-massCanvasDef.quarity)
        const pos = state.pos.add(diffForStart).mul(massCanvasDef.scenePageQuarity/massCanvasDef.quarity)

        if(state.rotateAngle !== undefined){
            this.ctx.moveTo(...pos.getPair())
            this.ctx.lineTo(...pos.add([r*2,0]).toRevolved(state.rotateAngle,pos).getPair())
        }
        this.ctx.stroke()
        this.ctx.moveTo(...pos.getPair())
        this.ctx.arc(...pos.getPair(),r,0,2*Math.PI)
        this.ctx.fill()
    }
    drawGrid(){
        const cellSize = massCanvasDef.scenePageQuarity
        this.fillBack()
        this.drawMainGrid(
            cellSize,
            new Point(cellSize,cellSize),
            massCanvasDef.gridRowsNum-1,
            massCanvasDef.gridColsNum-1,
            massCanvasDef.centerGridColor
        )
        this.drawSupGrid(cellSize)
        
    }
    protected drawMainGrid(cellSize: number,startPoint: Point,rowCellsNum: number,colCellsNum: number,color: string){
        // 基本グリッド
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
        this.ctx.moveTo(centerX-w2/2,centerY-w2/2)
        this.ctx.lineTo(centerX+w2/2,centerY+w2/2)
        
        this.ctx.moveTo(centerX+w2/2,centerY-w2/2)
        this.ctx.lineTo(centerX-w2/2,centerY+w2/2)

        this.ctx.stroke()
    }
    fillBack(){
        if(this.ctx === null) return
        this.ctx.beginPath()
        this.ctx.fillStyle = massCanvasDef.backGroundColor
        this.ctx.fillRect(0,0,this.Width,this.Height)
    }
    clearAll(){
        this.ctx?.clearRect(0,0,this.Width,this.Height)
    }
}