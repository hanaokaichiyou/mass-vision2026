import { Narve, nr } from "narve";
import { setNumKeyOperations } from "../../../global/ShortcutKey";

export default class RootMenu extends Narve.Component {
    deployBtn = nr("button",{},"1．配置")
    rotateAngleBtn = nr("button",{},"2．初期方向設定")
    specialRotateAngleBtn = nr("button",{},"3．特殊初期方向設定")
    macroEditBtn = nr("button",{},"4．マクロ編集")
    slideEditBtn = nr("button",{},"5．スライド編集")
    colorIndexBtn = nr("button",{},"6．色分け")
    idBtn = nr("button",{},"7．番号")
    pamphSettingBtn = nr("button",{},"8．パンフ設定")
    varsSettingsBtn = nr("button",{},"9．変数設定")
    constructor(){
        super("div",{class: "rootMenuArea"})
        this.children.set(
            this.deployBtn,
            this.rotateAngleBtn,
            this.specialRotateAngleBtn,
            this.macroEditBtn,
            this.slideEditBtn,
            this.colorIndexBtn,
            this.idBtn,
            this.pamphSettingBtn,
            this.varsSettingsBtn,
        )
    }
    display(display?: string): void {
        super.display(display)
        this.onDisplay()
    }
    onDisplay(){
        setNumKeyOperations([
            undefined,
            this.deployBtn,
            this.rotateAngleBtn,
            this.specialRotateAngleBtn,
            this.macroEditBtn,
            this.slideEditBtn,
            this.colorIndexBtn,
            this.idBtn,
            this.pamphSettingBtn,
            this.varsSettingsBtn,
        ].map(nar => nar?() => nar.elem.focus() : undefined))
    }
}