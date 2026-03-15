import { Narve } from "narve";
import { timeLineDef } from "./timeLineDef";
import Point from "../../../../global/Point";
import { UUID } from "../../../../global/utility";
import TimeLine, { StartCounts } from "../timeLine";

export type SlowSegments =  Map<UUID,{seg: [number,number], cpm: number}>
export default class SlowBar extends Narve.Component<HTMLCanvasElement> {
    ctx: CanvasRenderingContext2D|null = null
    Width: number = 0
    Height: number = 0
    
    expandingSegId: UUID|null = null
    isExpandingLeft = false
    // 右半開区間
    slowSegments: SlowSegments = new Map()
    count = 0
    defaultCPM = 180

    parent: TimeLine
    constructor(parent: TimeLine){
        super("canvas",{class: "slowBar"})
        this.parent = parent
        this.ctx = this.elem.getContext("2d")

        this.elem.oncontextmenu = e => e.preventDefault()
        this.elem.onmousemove = e => this.onMouseMove(e)
        this.elem.onmousedown = e => this.onMouseDown(e)
        this.elem.onmouseup   = 
        this.elem.onmouseout  = e => this.onMouseUp(e)
        
        this.setCountAndResize(0)
    }
    reload(startCounts: StartCounts = this.parent.startCounts){
        this.setCountAndResize(this.count,startCounts.massStartCount)
        this.renderBar(startCounts.massStartCount)
        this.renderSeg(startCounts.massStartCount)
    }
    loadScene(count: number,slowSegments: SlowSegments){
        this.setCountAndResize(count)
        this.slowSegments = slowSegments

        this.renderBar()
        this.renderSeg()
        /*　FROM 
        [x] src\global\CreateSaveData.tsでscenesのslowSegmentsを保存できるようにする 
        [x] 読み込めるようにする
        [x] 再生のタイミングでslowSegmentsを反映できるようにする
        [x] slowBarがsceneのslowSegmentsを直接触れるように、シーン変更時と、最初にslowSegmentsを渡す
        [ ] 右エリアのメニューにスロー設定とかつけてみる？無しでもいいかな
        */
    }
    setCountAndResize(count: number,massStartCount = this.parent.startCounts.massStartCount){
        this.count = count

        this.Width = (massStartCount + this.count) * timeLineDef.countLineGapPx + 1
        if(this.count === 0) this.Width = 0
        this.Height = timeLineDef.slowBarHeightPx
        
        this.elem.width = this.Width
        this.elem.height = this.Height
    }
    renderBar(massStartCount = this.parent.startCounts.massStartCount){
        if(this.ctx === null) return
        const gap = timeLineDef.countLineGapPx
        this.ctx.fillStyle = timeLineDef.slowBarBack
        this.ctx.beginPath()
        this.ctx.fillRect(massStartCount * gap,0,this.count * gap + 1,timeLineDef.massBarHeightPx)
    }
    renderSeg(massStartCount = this.parent.startCounts.massStartCount){
        this.slowSegments.forEach(({seg}) => this.drawASeg(seg,false,massStartCount))
    }
    onMouseMove(e: MouseEvent){
        const count = this.offsetToCount(e)
        if(this.expandingSegId === null){// 非選択状態
            let isOnBorder = false
            for(const [_,{seg}] of this.slowSegments){
                if(seg[0] === count || seg[1] === count){
                    isOnBorder = true
                    break
                }
            }
            this.elem.style.cursor = isOnBorder?"ew-resize":"default"
        }else{// 選択状態
            const curSeg = this.slowSegments.get(this.expandingSegId)?.seg
            if(curSeg === undefined) return
            const newSeg: [number,number] = [...curSeg]

            if(this.isExpandingLeft) newSeg[0] = count
            else newSeg[1] = count

            // 左右が入れ替わったり、他の区間とかぶらないようにする
            if(newSeg[0] >= newSeg[1]) return
            const leftCountId = this.getIdByCount(newSeg[0])
            const rightCountId = this.getIdByCount(newSeg[1]-1)
            if(leftCountId !== undefined && leftCountId !== this.expandingSegId){
                // TODO できればSeg木導入する
                this.clearSelect()
                return
            }
            if(rightCountId !== undefined && rightCountId !== this.expandingSegId){
                this.clearSelect()
                return
            }
            
            this.updateAndDrawSeg(this.expandingSegId,newSeg, true)
            this.elem.style.cursor = "ew-resize"
        }
    }
    onMouseDown(e: MouseEvent){
        const count = this.offsetToCount(e)

        if(e.button === 0){// 左クリック
            // 意味わからんけど、押したときにもうexpandingだったら何もしない
            if(this.expandingSegId !== null) return

            for(const [id,{seg}] of this.slowSegments){
                if(seg[0] === count){
                    this.expandingSegId = id
                    this.isExpandingLeft = true
                    this.drawASeg(seg,true)
                    break
                }
                if(seg[1] === count){
                    this.expandingSegId = id
                    this.isExpandingLeft = false
                    this.drawASeg(seg,true)
                    break
                }
            }
            // expandだったときはここで終わり
            if(this.expandingSegId !== null) return
            const id = this.getIdByCount(count)
            // スロー区間をクリックしたらそこのCPMを入力できる
            if(id !== undefined){
                const {seg,cpm} = this.slowSegments.get(id)!
                const newCPM = Number(prompt("BPMを入力",`${cpm}`))
                if(Number.isNaN(newCPM)) return
                this.slowSegments.set(id,{seg: seg,cpm: newCPM})
            }
        }else if(e.button === 2){// 右クリック
            e.preventDefault()
            if(this.getIdByCount(count) === undefined){
                if(count < this.count) this.addAndDrawSegByCount(count)
            }else{
                this.removeAndDrawSegByCount(count)
            }
        }
    }
    onMouseUp(_: MouseEvent){
        this.clearSelect()
    }
    protected clearSelect(){
        if(this.expandingSegId !== null){
            const seg = this.slowSegments.get(this.expandingSegId)?.seg
            if(seg !== undefined) this.drawASeg(seg,false)
            this.expandingSegId = null
        }
    }
    protected getIdByCount(count: number){
        for(const [id,{seg}] of this.slowSegments){
            if(seg[0] <= count && count < seg[1]){
                return id
            }
        }
        return undefined
    }
    protected offsetToCount(e: MouseEvent){
        const gap = timeLineDef.countLineGapPx
        const px = Math.round(e.offsetX*(this.Width/this.elem.getBoundingClientRect().width))
            - this.parent.startCounts.massStartCount * gap
        const py = Math.round(e.offsetY*(this.Height/this.elem.getBoundingClientRect().height))
        const point = new Point(px,py).nearestGrid(gap)
        return Math.round(point.x / gap)
    }
    protected drawASeg(seg: [number,number],selected = false,massStartCount = this.parent.startCounts.massStartCount){
        if(this.ctx === null) return
        const gap = timeLineDef.countLineGapPx
        this.ctx.fillStyle = selected? timeLineDef.slowBarSelectedFront : timeLineDef.slowBarFront
        this.ctx.beginPath()
        this.ctx.fillRect((massStartCount + seg[0])*gap, 0, (seg[1] - seg[0]) * gap, timeLineDef.slowBarHeightPx)
    }
    protected eraceASeg(seg: [number,number]){
        if(this.ctx === null) return
        const gap = timeLineDef.countLineGapPx
        const startCnt = this.parent.startCounts.massStartCount
        this.ctx.fillStyle = timeLineDef.slowBarBack
        this.ctx.beginPath()
        this.ctx.fillRect((startCnt + seg[0])*gap, 0, (seg[1] - seg[0]) * gap, timeLineDef.slowBarHeightPx)
    }
    protected addAndDrawSegByCount(startCount: number,length = 1){
        // Warning どれかの区間にstartCountが含まれているかの確認はしないので注意
        const seg: [number,number] = [startCount,startCount+length]
        this.slowSegments.set(crypto.randomUUID(),{seg: seg,cpm: Math.round(this.defaultCPM/2)})
        this.drawASeg(seg)
    }
    // includingCountは小数可
    protected removeAndDrawSegByCount(includingCount: number){
        const id = this.getIdByCount(includingCount)
        if(id){
            const seg = this.slowSegments.get(id)!.seg
            this.eraceASeg(seg)
            this.slowSegments.delete(id)
        }
    }
    protected updateAndDrawSeg(id: UUID, newSeg: [number,number],selected = false){
        const cur = this.slowSegments.get(id)
        if(cur === undefined) return
        const curSeg = cur.seg
        // 更新
        this.slowSegments.set(id,{seg: newSeg,cpm: cur.cpm})
        // まず消す(背景色で塗る)
        this.eraceASeg(curSeg)
        // 次に描く
        this.drawASeg(newSeg,selected)
        console.log("updated: ",id,curSeg, newSeg)
    }
    // FROM スローの更新処理から書く
}