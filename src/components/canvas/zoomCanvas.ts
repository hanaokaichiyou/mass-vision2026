import { massCanvasDef } from "../../global/massCanvasDef";
import Point from "../../global/Point";
import PointDiff from "../../global/PointDiff";
import Scene from "../../global/Scene";
import EditField from "../Edit/EditField";
import MassCanvas from "./massCanvas";

export default class ZoomCanvas extends MassCanvas {
    zoomable = false
    ZOOM_RECT_W = this.quarity * 10
    ZOOM_RECT_H = this.quarity * 10
    parent: EditField

    zoomLevel = 3// 相似比、整数
    scene: Scene|null = null
    constructor(parent: EditField){
        super()
        this.parent = parent
        this.elem.onmousedown = e => {
            this.onMouseDown(e)
            if(e.button === 0) parent.uiCanvas.onMouseDown(e)
        }
        this.elem.onmousemove = e => {
            this.onMouseMove(e)
            parent.uiCanvas.onMouseMove(e)
        }
        this.elem.onmouseout = e => {
            this.onMouseOut(e)
            parent.uiCanvas.onMouseOut(e)
        }
        this.elem.onmouseup = e => {
            this.onMouseUp(e)
            parent.uiCanvas.onMouseUp(e)
        }
    }
    drawZoom(centerPoint: Point){
        if(this.ctx === null) return
        if(this.parent.backCanvas.ctx === null) return
        if(this.parent.uiCanvas.ctx === null) return
        if(this.scene === null) return
        const diff = new PointDiff(this.ZOOM_RECT_W,this.ZOOM_RECT_H)

        // 枠
        this.ctx.strokeStyle = "#fff"
        this.ctx.lineWidth = this.quarity/2
        this.ctx.strokeRect(...centerPoint.sub(diff.mul(1/2)).getPair(),...diff.getPair())
        
        // 背景
        this.ctx.fillStyle = massCanvasDef.backGroundColor
        this.ctx.fillRect(...centerPoint.sub(diff.mul(1/2)).getPair(),...diff.getPair())

        // backCanvasの転写
        const backImgData = this.parent.backCanvas.ctx.getImageData(...centerPoint.sub(diff.mul(1/(2*this.zoomLevel))).getPair(),...diff.mul(1/this.zoomLevel).getPair())
        const backZoomedImgData = new ImageData(...diff.getPair())
        for(let y = 0; y < backImgData.height; y++) for(let x = 0;x < backImgData.width; x++){
            const idx = (y * backImgData.width + x) * 4;
            if(backImgData.data[idx+3] === 0) continue
            for(let i = 0;i < this.zoomLevel;i++) for(let j = 0;j < this.zoomLevel;j++){
                const zoomedY = y * this.zoomLevel + i
                const zoomedX = x * this.zoomLevel + j
                const zoomedIdx = (zoomedY * backZoomedImgData.width + zoomedX) * 4
                for(let e = 0; e < 4;e++) backZoomedImgData.data[zoomedIdx + e] = backImgData.data[idx+e]
            }
        }
        this.ctx.putImageData(backZoomedImgData,...centerPoint.sub(diff.mul(1/2)).getPair())
        
        // personsCanvasの転写
        const left = centerPoint.x - diff.x/(2*this.zoomLevel)
        const right = centerPoint.x + diff.x/(2*this.zoomLevel)
        const top = centerPoint.y - diff.y/(2*this.zoomLevel)
        const bottom = centerPoint.y + diff.y/(2*this.zoomLevel)

        this.scene.persons.forEach(person => {
            const pos = person.startState.pos
            if((pos.x - left) * (pos.x - right) <= 0 && (pos.y - top) * (pos.y - bottom) <= 0){

                this.plotAperson(
                    pos.sub(centerPoint).mul(this.zoomLevel).add(centerPoint),
                    person.startState.rotateAngle,
                    person.colorIndex,
                    person.id
                )
            }
        })

        // UICanvasの転写と
        const zoomImgData = this.ctx.getImageData(...centerPoint.sub(diff.mul(1/2)).getPair(),...diff.getPair())
        const UIImgData = this.parent.uiCanvas.ctx.getImageData(...centerPoint.sub(diff.mul(1/(2*this.zoomLevel))).getPair(),...diff.mul(1/this.zoomLevel).getPair())
        // const UIZoomedImgData = new ImageData(...diff.getPair())
        for(let y = 0; y < UIImgData.height; y++) for(let x = 0;x < UIImgData.width; x++){
            const idx = (y * UIImgData.width + x) * 4
            if(UIImgData.data[idx+3] === 0) continue
            for(let i = 0;i < this.zoomLevel;i++) for(let j = 0;j < this.zoomLevel;j++){
                const zoomedY = y * this.zoomLevel + i
                const zoomedX = x * this.zoomLevel + j
                const zoomedIdx = (zoomedY * zoomImgData.width + zoomedX) * 4
                for(let e = 0; e < 4;e++) zoomImgData.data[zoomedIdx + e] = UIImgData.data[idx+e]
            }
        }
        this.ctx.putImageData(zoomImgData,...centerPoint.sub(diff.mul(1/2)).getPair())
    }
    plotAperson(pos: Point, rotateAngle: number,colorIndex: number,dispNumber?: number){
        if(this.ctx === null) return
        const r = massCanvasDef.personMarkerR * this.zoomLevel

        this.ctx.beginPath()
        this.ctx.lineWidth = 2 * this.zoomLevel
        this.ctx.strokeStyle = massCanvasDef.personMarkerColors[colorIndex]||"#fff"
        this.ctx.fillStyle = massCanvasDef.personMarkerColors[colorIndex]||"#fff"
        if(rotateAngle !== undefined){
            this.ctx.moveTo(...pos.getPair())
            this.ctx.lineTo(...pos.add([r*2,0]).toRevolved(rotateAngle,pos).getPair())
        }
        this.ctx.stroke()
        this.ctx.moveTo(...pos.getPair())
        this.ctx.arc(...pos.getPair(),r,0,2*Math.PI)
        this.ctx.fill()
        if(dispNumber !== undefined){
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.font = `${this.quarity*this.zoomLevel / 4}px sans-serif`
            this.ctx.fillStyle = "#000"
            this.ctx.fillText(dispNumber.toString(),...pos.getPair())
        }
    }
    onMouseMove(e: MouseEvent){
        this.clearAll()
        if(this.zoomable){
            const point = this.offsetToPoint(e)
            // this.clearAll()
            this.drawZoom(point)
        }
    }
    onMouseDown(e: MouseEvent){
        if(e.button === 1){
            this.toggleZoomable()
        }
    }
    onMouseOut(e: MouseEvent){
        e
        this.clearAll()
    }
    onMouseUp(e: MouseEvent){e}
    toggleZoomable(){
        this.zoomable = !this.zoomable
        this.clearAll()
    }
    unZoomable(){
        this.zoomable = false
        this.clearAll()
    }
    protected offsetToPoint(e: MouseEvent){
        const px = Math.round(e.offsetX*(this.Width/this.elem.getBoundingClientRect().width))
        const py = Math.round(e.offsetY*(this.Height/this.elem.getBoundingClientRect().height))
        return new Point(px,py)
    }
}