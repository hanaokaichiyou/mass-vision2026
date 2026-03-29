import { massCanvasDef as ms } from "../../global/massCanvasDef";
import Point from "../../global/Point";
import MassCanvas from "./massCanvas";
import PersonState from "../../global/PersonState";
import Person from "../../global/Person";
import Slide from "../../global/Slide";
import EditField from "../Edit/EditField";


export default class UICanvas extends MassCanvas {
    parent: EditField
    constructor(parent: EditField){
        super()
        this.parent = parent
        this.elem.classList.add("uiCanvas")
        this.elem.onmousedown = e => {
            this.onMouseDown(e)
            parent.zoomCanvas.onMouseDown(e)
        }
        this.elem.onmousemove = e => {
            this.onMouseMove(e)
            parent.zoomCanvas.onMouseMove(e)
        }
        this.elem.onmouseout = e => {
            this.onMouseOut(e)
            parent.zoomCanvas.onMouseOut(e)
        }
    }

    getAccuratePoint(mouseMoveCustom?: (point: Point) => any): Promise<Point|null>{
        return new Promise(resolve => {
            let dullClickStart: Point|null = null
            this.onMouseDown = e => dullClickStart = this.offsetToPoint(e)
            this.onMouseMove = (e) => {
                this.clearAll()
                this.ondullmousemove(e,dullClickStart)
                console.log("custom")
                if(dullClickStart !== null){
                    mouseMoveCustom?.(this.calcDullMousePos(dullClickStart,this.offsetToPoint(e)))
                }else{
                    mouseMoveCustom?.(this.offsetToPoint(e))
                }
            }
            this.elem.onmouseup   = this.onMouseOut
                                  = (e) => {
                this.clearAll()
                mouseMoveCustom?.(this.offsetToPoint(e))
                if(dullClickStart !== null){
                    this.ondullmouseup(e,dullClickStart,resolve)
                    this.clearAll()
                    this.clearEvents()
                }
            }
            this.cancel = () => {
                resolve(null)
                this.clearAll()
                this.clearEvents()
                this.cancel = () => {}
            }
        })
    }
    async getAccurateLine(mouseMoveCustom?: (point: Point) => any): Promise<[Point,Point]|null>{
        const point1 = await this.getAccuratePoint(mouseMoveCustom)
        if(point1 === null) return null
        this.drawPoint(point1)
        const point2 = await this.getAccuratePoint(dullPoint => {
            this.clearAll()
            mouseMoveCustom?.(dullPoint)
            this.drawLine(point1,dullPoint)
        })
        if(point2 === null) return null
        return [point1,point2]
    }
    async getAccurateCircle(mouseMoveCustom?: (point: Point) => any): Promise<[Point,Point]|null>{
        const point1 = await this.getAccuratePoint(mouseMoveCustom)
        if(point1 === null) return null
        this.drawPoint(point1)
        const point2 = await this.getAccuratePoint(dullPoint => {
            this.clearAll()
            mouseMoveCustom?.(dullPoint)
            this.drawCircle(point1,dullPoint)
            this.drawPoint(dullPoint)
        })
        if(point2 === null) return null
        return [point1,point2]
    }
    async getAccurateRect(mouseMoveCustom?: (point: Point) => any): Promise<[Point,Point]|null>{
        const point1 = await this.getAccuratePoint(mouseMoveCustom)
        if(point1 === null) return null
        this.drawPoint(point1)
        const point2 = await this.getAccuratePoint(dullPoint => {
            this.clearAll()
            mouseMoveCustom?.(dullPoint)
            this.drawRect(point1,dullPoint)
        })
        if(point2 === null) return null
        return [point1,point2]
    }
    getPoint(mouseMoveCustom?: (point: Point) => any): Promise<Point|null>{
        return new Promise(resolve => {
            if(mouseMoveCustom != undefined){
                this.clearAll()
                this.onMouseMove = (e) => {
                    mouseMoveCustom(this.offsetToPoint(e))
                }
            }
            this.elem.onmouseup = (e) => {
                resolve(this.offsetToPoint(e))
                this.clearEvents()
            }
            this.cancel = () => {
                resolve(null)
                this.clearEvents()
                this.cancel = () => {}
            }
        })
    }
    getRect(onRangeChange?: (p:[Point,Point])=>any): Promise<[Point,Point]|null>{
        return new Promise(resolve => {
            let dragStart: Point|null = null
            this.onMouseDown = e => dragStart = this.offsetToPoint(e)
            this.onMouseMove = (e) => {
                if(dragStart !== null){
                    this.clearAll()
                    onRangeChange?.([dragStart,this.offsetToPoint(e)])
                    this.drawRect(dragStart,this.offsetToPoint(e))
                }
            }
            this.elem.onmouseup   = this.onMouseOut
                                  = (e) => {
                if(dragStart !== null){
                    resolve([dragStart,this.offsetToPoint(e)])
                    this.clearEvents()
                }
            }
            this.cancel = () => {
                resolve(null)
                this.clearEvents()
                this.cancel = () => {}
            }
        })
    }
    getCircle(onRangeChange?: (p:[Point,Point])=>any): Promise<[Point,Point]|null>{
        return new Promise(resolve => {
            let dragStart: Point|null = null
            this.onMouseDown = e => dragStart = this.offsetToPoint(e)
            this.onMouseMove = (e) => {
                if(dragStart !== null){
                    this.clearAll()
                    onRangeChange?.([dragStart,this.offsetToPoint(e)])
                    this.drawCircle(dragStart,this.offsetToPoint(e))
                }
            }
            this.elem.onmouseup   = this.onMouseOut
                                  = (e) => {
                if(dragStart !== null){
                    resolve([dragStart,this.offsetToPoint(e)])
                    this.clearEvents()
                }
            }
            this.cancel = () => {
                resolve(null)
                this.clearEvents()
                this.cancel = () => {}
            }
        })
    }
    async getPara(onRangeChange?: (p:[Point,Point,Point])=>any): Promise<[Point,Point,Point]|null>{
        const [point1,point2] = await new Promise<[Point|null,Point|null]>(resolve => {
            let point1: Point|null = null
            this.onMouseDown = e => point1 = this.offsetToPoint(e)
            this.onMouseMove = (e) => {
                if(point1 !== null){
                    this.clearAll()
                    onRangeChange?.([point1,this.offsetToPoint(e),this.offsetToPoint(e)])
                    this.drawLine(point1,this.offsetToPoint(e))
                }
            }
            this.elem.onmouseup   = this.onMouseOut
                                  = (e) => {
                if(point1 !== null){
                    resolve([point1,this.offsetToPoint(e)])
                    this.clearEvents()
                }
            }
            this.cancel = () => {
                resolve([null,null])
                this.clearEvents()
                this.cancel = () => {}
            }
        })
        if(point1 === null || point2 === null) return null
        const point3 = await this.getPoint(p => {
            this.clearAll()
            onRangeChange?.([point1,point2,p])
            this.drawPara(point1,point2,p)
        })
        if(point3 === null) return null
        return [point1,point2,point3]
    }
    cancel(){
        // will be defined when get... was called
    }
    protected offsetToPoint(e: MouseEvent){
        const px = Math.round(e.offsetX*(this.Width/this.elem.getBoundingClientRect().width))
        const py = Math.round(e.offsetY*(this.Height/this.elem.getBoundingClientRect().height))
        return new Point(px,py)
    }
    protected ondullmousemove(e: MouseEvent,dullClickStart: Point|null){
        if(dullClickStart === null) return
        const point = this.offsetToPoint(e)
        const dullPoint = this.calcDullMousePos(dullClickStart,point)
        this.clearAll()
        this.drawPoint(dullPoint)
        this.onHoveringPointChanged(dullPoint)
    }
    protected ondullmouseup(e: MouseEvent,dullClickStart: Point,resolve: (value: Point) => void){
        const point = this.offsetToPoint(e)
        const dullPoint = this.calcDullMousePos(dullClickStart,point)
        resolve(dullPoint)
    }
    protected calcDullMousePos(startPoint: Point,point: Point){
        const diff = point.sub(startPoint).toDiff()
        return startPoint.add(diff.mul(ms.dullMouseSensitivity)).nearest()
    }
    drawPoint(pos: Point){
        if(this.ctx === null) return
        this.ctx.beginPath()
        this.ctx.fillStyle = ms.selectGridMarkerColor
        this.ctx.moveTo(...pos.getPair())
        this.ctx.arc(...pos.getPair(),ms.personMarkerR,0,2*Math.PI)   
        this.ctx.fill()
    }
    drawLine(startPos: Point, endPos: Point){
        if(this.ctx === null) return
        this.ctx.beginPath()
        this.ctx.lineWidth = ms.uiLineWidth
        this.ctx.strokeStyle = ms.uiStrokeColor
        this.ctx.moveTo(...startPos.getPair())
        this.ctx.lineTo(...endPos.getPair())
        this.ctx.stroke()
    }
    drawRect(startPos: Point,endPos: Point){
        if(this.ctx === null) return
        this.ctx.beginPath()
        this.ctx.fillStyle = ms.uiFillColor
        this.ctx.fillRect(
            ...startPos.getPair(),...endPos.sub(startPos).getPair()
        )
    }
    drawCircle(center: Point,otherP: Point){
        if(this.ctx === null) return
        const R = center.distance(otherP)
        this.ctx.beginPath()
        this.ctx.strokeStyle = ms.uiStrokeColor
        this.ctx.lineWidth = 4
        this.ctx.arc(...center.getPair(),R,0,2*Math.PI)
        this.ctx.stroke()
    }
    drawPara(...[point1,point2,point3]: [Point,Point,Point]){
        if(this.ctx === null) return
        this.ctx.beginPath()
        this.ctx.fillStyle = ms.uiFillColor
        
        this.ctx.moveTo(...point1.getPair())
        this.ctx.lineTo(...point2.getPair())
        this.ctx.lineTo(...point3.getPair())
        this.ctx.lineTo(...point3.add(point1.sub(point2)).getPair())
        this.ctx.fill()
    }
    drawPersonGoast(state: PersonState){
        if(this.ctx === null) return
        const r = ms.personMarkerR

        this.ctx.beginPath()
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = ms.uiGoastColor
        this.ctx.fillStyle = ms.uiGoastColor
        if(state.rotateAngle !== undefined){
            this.ctx.moveTo(...state.pos.getPair())
            this.ctx.lineTo(...state.pos.add([r*2,0]).toRevolved(state.rotateAngle,state.pos).getPair())
        }
        this.ctx.stroke()
        this.ctx.moveTo(...state.pos.getPair())
        this.ctx.arc(...state.pos.getPair(),r,0,2*Math.PI)
        this.ctx.fill()
    }
    drawDestGoast(pos: Point){
        this.drawSlideDestMark(pos)
    }
    drawMacroMarker(pos: Point,macroIndex: number|undefined,reverseFlag: boolean){
        if(this.ctx === null) return
        // 普通に白色で人を書く
        const r = ms.personMarkerR
        this.ctx.beginPath()
        this.ctx.fillStyle = ms.macroMarkDefColor
        this.ctx.arc(...pos.getPair(),r,0,2*Math.PI)
        this.ctx.fill()
        if(macroIndex === undefined) return
        
        let bigIndex = false
        if(macroIndex >= ms.macroMarkColors.length){
            bigIndex = true
            macroIndex -= ms.macroMarkColors.length
            this.ctx.fillStyle = ms.macroMarkColors[macroIndex]
        }else{
            this.ctx.strokeStyle = ms.macroMarkColors[macroIndex]
            this.ctx.lineWidth = 2
        }

        if(ms.macroMarkColors[macroIndex] === undefined) return
        this.ctx.beginPath()
        if(reverseFlag) this.ctx.rect(...pos.sub([r,r]).getPair(),r*2,r*2)
        else this.ctx.arc(...pos.getPair(),r,0,2*Math.PI)

        if(bigIndex) this.ctx.fill()
        else this.ctx.stroke()
    }
    drawPersonsMacroMarkers(persons: Person[]){
        this.clearAll()
        persons.forEach(person => {
            this.drawMacroMarker(person.state.pos,person.macroIndex,person.reverseFlag)
        })
    }
    // 結局番号の話だからまくろとおなじでOK 
    drawPersonsVarMarkers(persons: Person[], varName: ms.VariableName){
        this.clearAll()
        persons.forEach(person => {
            this.drawMacroMarker(person.state.pos,person.variables[varName],person.reverseFlag)
        })
    }
    drawSelect(pos: Point){
        if(this.ctx === null) return
        const r = ms.personMarkerR
        this.ctx.beginPath()
        this.ctx.strokeStyle = ms.selectPersonMarkerColor
        this.ctx.lineWidth = 2
        this.ctx.rect(...pos.add([-1.5*r,-1.5*r]).getPair(),3*r,3*r)   
        this.ctx.stroke()
    }
    drawSlide(slide: Slide){
        slide.links.forEach(link => {
            if(link.absPos !== undefined){
                this.drawSlideDestMark(link.absPos)
                if(link.person !== undefined){
                    this.drawLinkConnection(link.person.state.pos,link.absPos)
                }
            }
        })
    }
    protected drawSlideDestMark(point: Point){
        if(this.ctx === null) return
        this.ctx.strokeStyle = ms.slideDestMarkColor
        this.ctx.lineWidth = 2
        const r = ms.personMarkerR
        this.ctx.beginPath()
        this.ctx.moveTo(...point.sub([r,r]).getPair())
        this.ctx.lineTo(...point.add([r,r]).getPair())
        this.ctx.moveTo(...point.sub([-r,r]).getPair())
        this.ctx.lineTo(...point.add([-r,r]).getPair())
        this.ctx.stroke()
    }
    protected drawLinkConnection(...points: [Point,Point]){
        if(this.ctx === null) return
        this.ctx.strokeStyle = ms.slideLinkColor
        this.ctx.lineWidth = 2
        this.ctx.beginPath()
        this.ctx.moveTo(...points[0].getPair())
        this.ctx.lineTo(...points[1].getPair())
        this.ctx.stroke()
    }

    protected clearEvents(){
        this.onMouseDown = this.elem.onmouseup = this.onMouseMove = this.onMouseOut = () => {}
    }
    onMouseMove(e: MouseEvent){e}
    onMouseDown(e: MouseEvent){e}
    onMouseOut(e: MouseEvent){e}
    onHoveringPointChanged(pos: Point){pos}
}