import { Narve, nr } from "narve";
import "./style/varsSettings.css"
import { massCanvasDef as ms } from "../../../global/massCanvasDef";
import Person from "../../../global/Person";
import RightPanel from "../rightPanel";

export default class VarsSettings extends Narve.Component {
    // applyBtn = nr("button",{},"変数適用")
    varNameSelect = nr<HTMLSelectElement>("select",{},
        ...Object.keys(ms.defVars()).map(varName => 
            nr("option",{},varName)
        )
    )
    private valInput = nr<HTMLInputElement>("input",{type: "number"})
    private incInput = nr<HTMLInputElement>("input",{type: "number",value: 1})

    // varDispBtn = nr("button",{},"変数確認")
    // varDispTBody = nr("tbody")

    parent: RightPanel
    constructor(parent: RightPanel){
        super()
        this.parent = parent
        this.children.set(
            // this.applyBtn,
            nr("table",{class: "varsSettingsTable"},
                nr("tr",{},
                    nr("th",{},"変数名"),
                    nr("th",{},"値"),
                    nr("th",{},"増分"),
                ),
                nr("tr",{},
                    nr("td",{},this.varNameSelect),
                    nr("td",{},this.valInput),
                    nr("td",{},this.incInput),
                )
            ),
            // this.varDispBtn,
            // nr("table",{class: "varsSettingsTable"},
            //     nr("thead",{},nr("tr",{},
            //         nr("th",{},"変数名"),
            //         nr("th",{},"値"),
            //     )),
            //     this.varDispTBody
            // )
        )
        // this.applyBtn.elem.onclick = () => this.onApplyBtnClicked()
        this.varNameSelect.elem.onchange = _ => {
            const varName = this.getVarName()
            if(varName === null) return
            this.onVarNameSelectChanged(varName)
        }
    }
    dispPersonVars(person: Person){
        person
        // this.varDispTBody.children.set(
        //     ...Object.entries(person.variables).map(([varName,val]) => 
        //         new VarRow(varName,val)
        //     )
        // )
    }
    onVarNameSelectChanged(varName: ms.VariableName){
        varName // define in project://src/components/Edit.ts
    }
    getVarName(): ms.VariableName|null{
        if(Object.keys(ms.defVars()).includes(this.varNameSelect.elem.value)){
            return this.varNameSelect.elem.value as ms.VariableName
        }else{
            return null
        }
    }
    getValue(): number|null{
        const val = Number(this.valInput.elem.value)
        if(!isNaN(val)){
            return val
        }else{
            return null
        }
    }
    getInc(): number|null{
        const inc = Number(this.incInput.elem.value)
        if(!isNaN(inc)){
            return inc
        }else{
            return null
        }
    }
    display(display?: string): void {
        super.display(display)
        this.parent.parent.currentIdMode = "var"
        this.parent.parent.drawFirstFrame()
        this.onDisplay()
    }
    hide(): void {
        super.hide()
        this.parent.parent.currentIdMode = "id"
        this.parent.parent.drawFirstFrame()
        this.onHide()
    }
    onDisplay(){
        // defined in project://src/components/Edit.ts
    }
    onHide(){
    }
}
export class VarRow extends Narve.Component<HTMLTableRowElement> {
    constructor(varName: string,val: number){
        super("tr")
        this.children.set(
            nr("td",{},nr("span",{},varName + " :")),
            nr("td",{},val.toString())
        )
    }
}