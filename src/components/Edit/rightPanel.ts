import { Narve, nr } from "narve";
import DeployBtns from "./rightPanel/deployBtns";
import RootMenu from "./rightPanel/rootMenu";
import MacroEditWindow from "./rightPanel/macroEditWindow";
import SlideEditWindow from "./rightPanel/slideEditWindow";
import SetColorIndexWindow from "./rightPanel/setColorIndexWindow";
import Scene from "../../global/Scene";
import IdWindow from "./rightPanel/idWindow";
import PamphSettings from "./rightPanel/pamphSettings";
import VarsSettings from "./rightPanel/varsSettings";
import { setNumKeyOperations } from "../../global/ShortcutKey";
import StatusCheckWindow from "./rightPanel/statusCheckWindow";
import Edit from "../Edit";
import RightHelpArea from "./rightPanel/rightHelpArea";
import "./style/rightPanel.css"

export default class RightPanel extends Narve.Component {
    rootMenu = new RootMenu()

    deployBtns = new DeployBtns(true)
    statusCheckWindow = new StatusCheckWindow(this)
    macroEditWindow = new MacroEditWindow(this)
    slideEditWindow = new SlideEditWindow()
    setColorIndexWindow = new SetColorIndexWindow()
    idWindow = new IdWindow()
    pamphSettings = new PamphSettings()
    varsSettings = new VarsSettings(this)

    windows = nr("div",{class: "windows"},
        this.rootMenu,
        this.deployBtns,
        this.statusCheckWindow,
        this.macroEditWindow,
        this.slideEditWindow,
        this.setColorIndexWindow,
        this.idWindow,
        this.pamphSettings,
        this.varsSettings,
    )

    rootBackBtn = nr("button",{class: "rootBackBtn"},"⌂")
    titleElem = nr("p")
    helpBtn = nr("button",{class: "helpBtn"},"?")
    titleArea = nr("div",{class: "titleArea"},this.rootBackBtn,this.titleElem,this.helpBtn)

    helpArea = new RightHelpArea()
    parent: Edit
    constructor(parent: Edit){
        super("div",{class: "rightPanel"})
        this.parent = parent
        this.children.set(this.titleArea,this.helpArea,this.windows)
        this.parent.leftPanel.clear()
        
        this.windows.switchFocus(this.rootMenu)
        this.setTitle("ホーム")
        this.helpArea.helps.switchFocus(this.helpArea.homeHelp)

        this.helpBtn.elem.onclick = () => {
            this.helpArea.elem.classList.toggle("display")
        }


        this.rootBackBtn.elem.onclick =
        this.deployBtns.elem.oncontextmenu = 
        this.statusCheckWindow.elem.oncontextmenu = 
        this.macroEditWindow.elem.oncontextmenu = 
        this.slideEditWindow.elem.oncontextmenu = 
        this.setColorIndexWindow.elem.oncontextmenu = 
        this.idWindow.elem.oncontextmenu = 
        this.pamphSettings.elem.oncontextmenu = 
        this.varsSettings.elem.oncontextmenu = (e) => {
            e.stopPropagation()
            e.preventDefault()

            this.goHome()
            
            parent.drawFirstFrame()
        }

        this.rootMenu.deployBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()
            
            this.windows.switchFocus(this.deployBtns)
            this.setTitle("配置")
            this.helpArea.helps.switchFocus(this.helpArea.deployHelp)
        }
        // 初期方向設定はleftPanelに指示を出すだけで画面遷移がないのでEdit.tsで記述されている

        // 特殊初期方向設定も同様
        this.rootMenu.statusCheckBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()
            
            this.windows.switchFocus(this.statusCheckWindow)
            this.setTitle("ステータス確認")
            this.helpArea.helps.switchFocus(this.helpArea.statusCheckHelp)
        }
        this.rootMenu.macroEditBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()

            this.windows.switchFocus(this.macroEditWindow)
            this.setTitle("マクロ編集")
            this.helpArea.helps.switchFocus(this.helpArea.macroEditHelp)

            this.macroEditWindow.setMacroIndex(0)
        }
        this.rootMenu.slideEditBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()

            this.windows.switchFocus(this.slideEditWindow)
            this.setTitle("スライド編集")
            this.helpArea.helps.switchFocus(this.helpArea.slideEditHelp)

            this.slideEditWindow.setSlideIndex(0)
        }
        this.rootMenu.colorIndexBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()

            this.windows.switchFocus(this.setColorIndexWindow)
            this.setTitle("色分け")
            this.helpArea.helps.switchFocus(this.helpArea.colorIndexHelp)
        }
        this.rootMenu.idBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()

            this.windows.switchFocus(this.idWindow)
            this.setTitle("番号")
            this.helpArea.helps.switchFocus(this.helpArea.idHelp)
        }
        this.rootMenu.varsSettingsBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()
            this.windows.switchFocus(this.varsSettings)
            this.setTitle("変数設定")
            this.helpArea.helps.switchFocus(this.helpArea.varsSettingsHelp)
        }
        this.rootMenu.pamphSettingBtn.elem.onclick = () => {
            this.parent.leftPanel.clear()

            this.windows.switchFocus(this.pamphSettings)
            this.setTitle("パンフ設定")
            this.helpArea.helps.switchFocus(this.helpArea.pamphSettingHelp)
        }

        setNumKeyOperations([() => {this.rootBackBtn.elem.focus()}])
    }
    setScene(scene: Scene){
        this.macroEditWindow.setScene(scene)
        this.slideEditWindow.setScene(scene)
        this.parent.leftPanel.clear()
        this.windows.switchFocus(this.rootMenu)
    }
    setTitle(title: string){
        this.titleElem.setInnerText(title)
    }
    goHome(){
        this.cancelAll()
        this.parent.leftPanel.clear()
        
        this.windows.switchFocus(this.rootMenu)
        this.setTitle("ホーム")
        this.helpArea.helps.switchFocus(this.helpArea.homeHelp)
    }
    async cancelAll(){
        // define in project://src/components/Edit.ts
    }
}