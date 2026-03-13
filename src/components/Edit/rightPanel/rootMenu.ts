import { Narve, nr } from "narve";
import { setNumKeyOperations } from "../../../global/ShortcutKey";

export default class RootMenu extends Narve.Component {
    deployBtn = nr("button",{},"1．配置")
    rotateAngleBtn = nr("button",{},"2．初期方向設定")
    specialRotateAngleBtn = nr("button",{},"特殊初期方向設定")
    statusCheckBtn = nr("button",{},"3．ステータス確認")
    macroEditBtn = nr("button",{},"4．マクロ編集")
    slideEditBtn = nr("button",{},"5．スライド編集")
    colorIndexBtn = nr("button",{},"6．色分け")
    idBtn = nr("button",{},"7．番号")
    varsSettingsBtn = nr("button",{},"8．変数設定")
    pamphSettingBtn = nr("button",{},"9．パンフ設定")
    constructor(){
        super("div",{class: "rootMenuArea"})
        this.children.set(
            this.deployBtn,
            this.rotateAngleBtn,
            this.specialRotateAngleBtn,
            this.statusCheckBtn,
            this.macroEditBtn,
            this.slideEditBtn,
            this.colorIndexBtn,
            this.idBtn,
            this.varsSettingsBtn,
            this.pamphSettingBtn,
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
            this.statusCheckBtn,
            this.macroEditBtn,
            this.slideEditBtn,
            this.colorIndexBtn,
            this.idBtn,
            this.varsSettingsBtn,
            this.pamphSettingBtn,
        ].map(nar => nar?() => nar.elem.focus() : undefined))
    }
}