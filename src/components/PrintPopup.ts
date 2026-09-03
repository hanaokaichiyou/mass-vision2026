import { Narve, nr } from "narve";
import "./styles/PrintPopup.css"
import App from "../App";
import { createPamphlet, isPamphMode } from "./pamphlet/createPamphlet";
import { message } from "@tauri-apps/plugin-dialog";

export default class PrintPopup extends Narve.Component {
    sectionSelect = nr<HTMLSelectElement>("select",{},
        nr("option",{value: "MoonFemale"},"月女"),
        nr("option",{value: "MoonFlag"},"月旗"),
        nr("option",{value: "SunFemale"},"赤女"),
        nr("option",{value: "SunShield"},"太陽盾"),
    )
    traceONCheck = nr<HTMLInputElement>("input",{type: "checkbox",id: "printPopup_traceON_OFF"})
    traceONLabel = nr("label",{for: "printPopup_traceON_OFF"},"トレース ON/OFF")
    traceDotCheck = nr<HTMLInputElement>("input",{type: "checkbox",id: "printPopup_traceDot"})
    traceDotLabel = nr("label",{for: "printPopup_traceDot"},"トレース上の点")
    detailPageSelect = nr<HTMLSelectElement>("select",{},
        nr("option",{value: "None"},"スライド分解図なし"),
        nr("option",{value: "allSlide"},"全てのスライド"),
        nr("option",{value: "exceptForLinkSlide"},"リンクスライド以外のスライド"),
    )

    printBtn = nr("button",{},"印刷")

    app: App
    constructor(app: App){
        super()
        this.app = app
        this.children.set(this.sectionSelect,
            this.traceONCheck,this.traceONLabel,
            this.traceDotCheck,this.traceDotLabel,
            this.detailPageSelect,
            this.printBtn,
        )

        this.traceONCheck.elem.onchange = () => {
            if(this.traceONCheck.elem.checked){
                this.traceDotCheck.elem.disabled = true
            }else{
                this.traceDotCheck.elem.disabled = false
            }
        }
        
        this.printBtn.elem.onclick = async () => {
            const mode = this.sectionSelect.elem.value
            if(!isPamphMode(mode)) {
                await message("パートを選択してください。")
                return
            }

            const traceON = this.traceONCheck.elem.checked

            const traceDot = this.traceDotCheck.elem.checked

            const detailPageMode = this.detailPageSelect.elem.value
            if(!isDetailPageMode(detailPageMode)){
                await message("スライド分解図の選択に誤りがあります。")
                return
            }
            app.resetId(0) // 番号を振りなおしておく
            const p = createPamphlet(app.scenes,app.edit.rightPanel.pamphSettings.checkeds,mode, traceON , traceDot, detailPageMode)
            app.pamphElem.children.set(p)
            console.log(p)
            window.print()
        }
    }

}

export type DetailPageMode = "None"|"allSlide"|"exceptForLinkSlide"
export const isDetailPageMode = (value: any): value is DetailPageMode => {
    return ["None","allSlide","exceptForLinkSlide"].includes(value)
}