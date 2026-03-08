import { Narve, nr } from "narve";
import DeployBtns from "./rightPanel/deployBtns";
import "./style/rightPanel.css"
import RootMenu from "./rightPanel/rootMenu";
import MacroEditWindow from "./rightPanel/macroEditWindow";
import SlideEditWindow from "./rightPanel/slideEditWindow";
import SetColorIndexWindow from "./rightPanel/setColorIndexWindow";
import Scene from "../../global/Scene";
import IdWindow from "./rightPanel/idWindow";
import PamphSettings from "./rightPanel/pamphSettings";
import VarsSettings from "./rightPanel/varsSettings";

export default class RightPanel extends Narve.Component {
    rootMenu = new RootMenu()

    deployBtns = new DeployBtns(true)
    macroEditWindow = new MacroEditWindow()
    slideEditWindow = new SlideEditWindow()
    setColorIndexWindow = new SetColorIndexWindow()
    idWindow = new IdWindow()
    pamphSettings = new PamphSettings()
    varsSettings = new VarsSettings()

    windows = nr("div",{class: "windows"},
        this.rootMenu,
        this.deployBtns,
        this.macroEditWindow,
        this.slideEditWindow,
        this.setColorIndexWindow,
        this.idWindow,
        this.pamphSettings,
        this.varsSettings,
    )

    rootBackBtn = nr("button",{class: "rootBackBtn"},"⌂")
    constructor(){
        super("div",{class: "rightPanel"})
        this.children.set(this.rootBackBtn,this.windows)
        this.windows.switchFocus(this.rootMenu)

        this.rootBackBtn.elem.onclick =
        this.deployBtns.elem.oncontextmenu = 
        this.macroEditWindow.elem.oncontextmenu = 
        this.slideEditWindow.elem.oncontextmenu = 
        this.setColorIndexWindow.elem.oncontextmenu = 
        this.idWindow.elem.oncontextmenu = 
        this.pamphSettings.elem.oncontextmenu = 
        this.varsSettings.elem.oncontextmenu = (e) => {
            e.stopPropagation()
            e.preventDefault()
            this.cancelAll()
            this.windows.switchFocus(this.rootMenu)
        }

        this.rootMenu.deployBtn.elem.onclick = () => this.windows.switchFocus(this.deployBtns)
        // 初期方向設定はleftPanelに指示を出すだけで画面遷移がないのでEdit.tsで記述されている
        // 特殊初期方向設定も同様
        this.rootMenu.macroEditBtn.elem.onclick = () => {
            this.windows.switchFocus(this.macroEditWindow)
            this.macroEditWindow.setMacroIndex(0)
        }
        this.rootMenu.slideEditBtn.elem.onclick = () => {
            this.windows.switchFocus(this.slideEditWindow)
            this.slideEditWindow.setSlideIndex(0)
        }
        this.rootMenu.colorIndexBtn.elem.onclick = () => this.windows.switchFocus(this.setColorIndexWindow)
        this.rootMenu.idBtn.elem.onclick = () => this.windows.switchFocus(this.idWindow)
        this.rootMenu.pamphSettingBtn.elem.onclick = () => this.windows.switchFocus(this.pamphSettings)
        this.rootMenu.varsSettingsBtn.elem.onclick = () => this.windows.switchFocus(this.varsSettings)
    }
    setScene(scene: Scene){
        this.macroEditWindow.setScene(scene)
        this.slideEditWindow.setScene(scene)
        this.windows.switchFocus(this.rootMenu)
    }
    cancelAll(){
        // define in project://src/components/Edit.ts
    }
}