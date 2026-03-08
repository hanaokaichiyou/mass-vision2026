import { Narve, nr } from "narve";

export default class RootMenu extends Narve.Component {
    deployBtn = nr("button",{},"配置")
    rotateAngleBtn = nr("button",{},"初期方向設定")
    specialRotateAngleBtn = nr("button",{},"特殊初期方向設定")
    macroEditBtn = nr("button",{},"マクロ編集")
    slideEditBtn = nr("button",{},"スライド編集")
    colorIndexBtn = nr("button",{},"色分け")
    idBtn = nr("button",{},"番号")
    pamphSettingBtn = nr("button",{},"パンフ設定")
    varsSettingsBtn = nr("button",{},"変数設定")
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
}