import { Narve, nr } from "narve";

import "./style/leftPanel.css"
import Point from "../../global/Point";
import { px2coordinates } from "../../global/coordinate";
import ExpandWindow from "./leftPanel/expandWindow";
import { massCanvasDef } from "../../global/massCanvasDef";
import NumOfPeopleDisp from "./leftPanel/numOfPeopleDist";
import { getPersonSelectSettingVal } from "../../global/Menu";

export default class LeftPanel extends Narve.Component {
    slctedPeopleNumDisp = nr("p")
    axisDisp = nr("p")

    expandWindow = new ExpandWindow()
    numOfPeopleDisp = new NumOfPeopleDisp()

    modeDisp = nr("p")
    orderDisp = nr("p")
    okBtn = nr("button",{},"OK")
    numberInput = nr<HTMLInputElement>("input",{type: "number"})
    
    // MEMO 角度の内部表現とユーザーへの表記が異なる
    angleSelect = nr<HTMLSelectElement>("select",{},
        nr("option",{value: "90"},"0(本部側)"),
        nr("option",{value: "45"},"45"),
        nr("option",{value: "0"},"90"),
        nr("option",{value: "315"},"135"),
        nr("option",{value: "270"},"180"),
        nr("option",{value: "225"},"225"),
        nr("option",{value: "180"},"270"),
        nr("option",{value: "135"},"315")
    )
    distanceSelect = nr<HTMLSelectElement>("select",{},
        nr("option",{value: massCanvasDef.quarity/3},"1/3"),
        nr("option",{value: massCanvasDef.quarity/2},"1/2"),
        nr("option",{value: massCanvasDef.quarity*2/3},"2/3"),
        nr("option",{value: massCanvasDef.quarity},"1"),
        nr("option",{value: massCanvasDef.quarity*4/3},"4/3"),
        nr("option",{value: massCanvasDef.quarity*3/2},"3/2"),
        nr("option",{value: massCanvasDef.quarity*5/3},"5/3"),
        nr("option",{value: massCanvasDef.quarity*2},"2")
    )
    rangeSelect = nr<HTMLSelectElement>("select",{},
        nr("option",{value: "rect"},"矩形選択"),
        nr("option",{value: "para"},"平行四辺形選択"),
    )
    alignSelect = nr<HTMLSelectElement>("select",{},
        nr("option",{value: massCanvasDef.quarity/1},"1マス上"),
        nr("option",{value: massCanvasDef.quarity/2},"1/2マス上"),
        nr("option",{value: massCanvasDef.quarity/3},"1/3マス上"),
        nr("option",{value: massCanvasDef.quarity/4},"1/4マス上")
    )

    // highlightText = nr("p",{contenteditable: true},"text")
    constructor(){
        super("div",{class: "leftPanel"})
        this.children.set(
            // this.highlightText,
            this.numOfPeopleDisp,
            this.axisDisp,this.expandWindow,
            this.modeDisp,this.orderDisp,
            this.numberInput,this.angleSelect,this.distanceSelect,this.rangeSelect,this.alignSelect,
            this.okBtn
        )
        /*this.highlightText.elem.oninput = _ => {
            const selection = window.getSelection()
            if(selection === null) return
            const range = selection.getRangeAt(0)
            
            const s = range.startOffset
            const e = range.endOffset

            const text = this.highlightText.elem.innerText
            console.log(s,e,text)
            this.highlightText.elem.innerHTML = text.replace(/blue/g,"<b>blue</b>")

            range.setStart(this.highlightText.elem, s)
            range.setEnd(this.highlightText.elem, e)
            selection.removeAllRanges()
            selection.addRange(range)       
        }*/
        this.okBtn.hide()
        this.numberInput.hide()
        this.angleSelect.hide()
        this.distanceSelect.hide()
        this.rangeSelect.hide()
        this.alignSelect.hide()
        this.rangeSelect.elem.onchange = () => {
            if(this.rangeSelect.elem.selectedIndex === 0){
                this.onRectRangeStart()
            }else{
                this.onParaRangeStart()
            }
        }
        // MEMO leftPanel上で右クリックしたらキャンセルできまーす
        this.elem.oncontextmenu = () => {
            this.cancel()
        }
    }
    
    setHoveringPoint(_pos: Point){
        const crd = px2coordinates(_pos)
        this.axisDisp.setInnerText(`(${crd[0]},${crd[1]})`)
        this.expandWindow.plotCursor(_pos)
    }
    setPeopleNum(n: number){
        this.numOfPeopleDisp.setInnerText(`${n}人配置済み`)
    }
    setModeDispStr(str: string){
        this.modeDisp.setInnerText(str)
    }

    order(str: string){
        this.orderDisp.setInnerText(str)
    }
    askNumber(str: string,oninput?: (n: number) => any): Promise<number|null>{
        this.orderDisp.setInnerText(str)
        this.numberInput.display()
        this.numberInput.elem.focus()
        this.numberInput.elem.oninput = () => oninput?.(Number(this.numberInput.elem.value)||0)
        this.okBtn.display()
        return new Promise(resolve => {
            this.numberInput.elem.onkeydown = e => {
                if(e.key === "Enter"){
                    const val = Number(this.numberInput.elem.value)
                    this.numberInput.elem.value = ""
                    this.numberInput.hide()
                    this.okBtn.hide()
                    if(Number.isNaN(val)) resolve(null)
                    else resolve(val)
                }
            }
            this.okBtn.elem.onclick = () => {
                const val = Number(this.numberInput.elem.value)
                this.numberInput.elem.value = ""
                this.numberInput.hide()
                this.okBtn.hide()
                if(Number.isNaN(val)) resolve(null)
                else resolve(val)
            }
            this.cancel = () => resolve(null)
            this.cancel = () => {}
        })
    }
    askAngle(str: string): Promise<number|null>{
        this.orderDisp.setInnerText(str)
        this.angleSelect.display()
        this.angleSelect.elem.focus()
        this.okBtn.display()
        return new Promise(resolve => {
            this.okBtn.elem.onclick = () => {
                const val = Number(this.angleSelect.elem.value)
                this.angleSelect.hide()
                this.okBtn.hide()
                if(Number.isNaN(val)) resolve(null)
                else resolve(val)
            }
            this.cancel = () => resolve(null)
            this.cancel = () => {}
        })
    }
    askDistance(str: string): Promise<number|null>{
        this.orderDisp.setInnerText(str)
        this.distanceSelect.display()
        this.distanceSelect.elem.focus()
        this.okBtn.display()
        return new Promise(resolve => {
            this.okBtn.elem.onclick = () => {
                const val = Number(this.distanceSelect.elem.value)
                this.distanceSelect.hide()
                this.okBtn.hide()
                if(Number.isNaN(val)) resolve(null)
                else resolve(val)
            }
            this.cancel = () => resolve(null)
            this.cancel = () => {}
        })
    }
    askAlign(str: string): Promise<number|null>{
        this.orderDisp.setInnerText(str)
        this.alignSelect.display()
        this.alignSelect.elem.focus()
        this.okBtn.display()
        return new Promise(resolve => {
            this.okBtn.elem.onclick = () => {
                const val = Number(this.alignSelect.elem.value)
                this.alignSelect.hide()
                this.okBtn.hide()
                if(Number.isNaN(val)) resolve(null)
                else resolve(val)
            }
            this.cancel = () => resolve(null)
            this.cancel = () => {}
        })
    }
    dispRangeSelect(){
        this.rangeSelect.display()
        const selectSetting = getPersonSelectSettingVal()
        if(selectSetting === "rect") this.rangeSelect.elem.selectedIndex = 0
        if(selectSetting === "parallel") this.rangeSelect.elem.selectedIndex = 1
        if(this.rangeSelect.elem.selectedIndex === 0){
            this.onRectRangeStart()
        }else{
            this.onParaRangeStart()
        }
            
    }
    onRectRangeStart(){}
    onParaRangeStart(){}
    clear(){
        this.modeDisp.setInnerText("")
        this.orderDisp.setInnerText("")
        this.angleSelect.hide()
        this.distanceSelect.hide()
        this.rangeSelect.hide()
        this.alignSelect.hide()
        this.numberInput.elem.value = ""
        this.numberInput.hide()
        this.okBtn.hide()
        this.cancel()
    }
    cancel(){

    }

}

