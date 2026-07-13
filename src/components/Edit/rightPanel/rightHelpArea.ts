import { Narve, nr } from "narve";
import "./style/rightHelpArea.css"

export default class RightHelpArea extends Narve.Component {
    homeHelp = new HomeHelp()
    deployHelp = new DeployHelp()
    statusCheckHelp = new StatusCheckHelp()
    macroEditHelp = new MacroEditHelp()
    slideEditHelp = new SlideEditHelp()
    colorIndexHelp = new ColorIndexHelp()
    idHelp = new IdHelp()
    varsSettingsHelp = new VarsSettingsHelp()
    pamphSettingHelp = new PamphSettingsHelp()

    helps = nr("div",{},
        this.homeHelp,
        this.deployHelp,
        this.statusCheckHelp,
        this.macroEditHelp,
        this.slideEditHelp,
        this.colorIndexHelp,
        this.idHelp,
        this.varsSettingsHelp,
        this.pamphSettingHelp,
    )

    hideBtn = nr("span",{class: "hideBtn"},"閉じる")
    constructor(){
        super("div",{class: "rightHelpArea"})
        this.children.set(this.helps,this.hideBtn)
        this.helps.switchFocus(nr())
        this.hideBtn.elem.onclick = () => {
            this.elem.classList.remove("display")
        }
    }
}
class HomeHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"全ての編集操作はここから始まります。右エリアの左上の「⌂」からいつでもこの画面に戻ってこれます。\n先頭に番号のついているボタンは"),
            nr("b",{},"「Alt+番号」"),
            nr("span",{},"でフォーカスできます。\nまずは"),
            nr("b",{},"「1. 配置」"),
            nr("span",{},"をクリックしてみましょう。"),
        )
    }
}
class DeployHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"人をマス上に配置していきましょう。"),nr("br"),
            nr("table",{},
                nr("tr",{},nr("th",{},"「・」"),  nr("td",{},"一点に配置")),
                nr("tr",{},nr("th",{},"「▢」"),nr("td",{},"長方形上に配置")),
                nr("tr",{},nr("th",{},"「〇」"),nr("td",{},"円周上に配置")),
                nr("tr",{},nr("th",{},"「／」"),nr("td",{},"線分上に配置")),
                nr("tr",{},nr("th",{},"「⇔」"),nr("td",{},"縦横の間隔を指定して長方形に配置")),
                nr("tr",{},nr("th",{},"「🗑」"),nr("td",{},"人を削除")),
                nr("tr",{},nr("th",{},"「♲」"),nr("td",{},"前シーンの最終位置を再利用")),
                nr("tr",{},nr("th",{},"「整」"),nr("td",{},"近くのキリのいいマスに移動")),
                nr("tr",{},nr("th",{},"「対称」"),nr("td",{},"様々な対称コピー")),
                nr("tr",{},nr("th",{},"「📋」"),nr("td",{},"コピー&ペースト")),
                nr("tr",{},nr("th",{},"「✄」"),nr("td",{},"カット&ペースト(移動)")),
            )
        )
    }
}
class StatusCheckHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"人をクリックしてステータスを確認してみましょう。"),
        )
    }
}
class MacroEditHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"マクロを追加・編集・適用していきましょう。"),nr("br"),
            nr("h4",{},"マクロの追加"),
            nr("span",{},"「マクロを追加」ボタンをクリックします。下エリアにマクロ入力欄が現れます。"),
            nr("h4",{},"マクロの編集"),
            nr("span",{},"セレクトボックスから編集したいマクロを選びます。「編集」ボタンをクリックすると下エリアにマクロ入力欄が現れます。マクロを手入力、または右エリアに現れる入力補助を利用して入力し、Enterで完了します。入力補助の選択項目や入力欄を埋めて✅を押すことでマクロ入力欄に追加されます。"),
            nr("h4",{},"マクロの適用"),
            nr("span",{},"セレクトボックスから適用したいマクロを選びます。編集エリア上で適用したい人を範囲選択して適用します。「ダッシュマクロを適用」のチェックを入れると、方転の向きが左右反転したマクロが適用されます。"),
        )
    }
}
class SlideEditHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"スライドを追加・編集・適用していきましょう。"),nr("br"),
            nr("h4",{},"スライドの追加"),
            nr("span",{},"「スライドを追加」ボタンをクリックします。"),
            nr("h4",{},"スライドの編集"),
            nr("span",{},"セレクトボックスから編集したいスライドを選びます。「目的地を編集」ボタンをクリックすると目的地の配置用ボタンが現れます。"),
            nr("h4",{},"スライドの適用"),
            nr("span",{},"セレクトボックスから適用したいスライドを選び、「リンク」ボタンをクリックします。マス上で人→目的地の順にクリックしてリンクします(クリックする順番はどっちが先でも良い)。"),
        
        )
    }
}
class ColorIndexHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"セレクトボックスから適用したい色を選択し、マス上で適用したい人を範囲選択します。"),nr("br"),
        )
    }
}
class IdHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"番号の確認、番号と色の振り直しをすることができます。番号は各シーンの人に配置時に割り振られます。リサイクルで配置したときは前シーンの番号が引き継がれますが、手動で配置したときは前シーンと独立に割り振られます。踏みがつながっている人に一貫した番号を振り、色を統一する作業が番号振り直しです。この時、どのシーンの番号・色にそろえるかを決めるのが基準シーンです。"),nr("br"),
            nr("h4",{},"番号の確認"),
            nr("span",{},"「番号の確認」をクリックし、人をクリックするとその人に割り振られた番号を確認できます。"),
            nr("h4",{},"番号の振り直し"),
            nr("span",{},"「基準のシーン」を選択し、「番号振り直し」をクリックするとそのシーンを基準にして番号が振りなおされます。"),
        )
    }
}
class VarsSettingsHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"変数を設定していきましょう。変数は複数人同時に設定できます。範囲選択の始点に一番近い人に初期値が設定され、近い順に増分ずつ足されながら設定されます。セレクトボックスから設定したい変数名を選択し、「値」には初期値、「増分」には増分を設定します。マス上で範囲選択することで設定できます。"),nr("br"),
        )
    }
}
class PamphSettingsHelp extends Narve.Component {
    constructor(){
        super()
        this.children.set(
            nr("span",{},"パンフレットで人を塗りつぶして表示するかどうかを色ごとに設定できます。\nパンフレットでは塗りつぶすと黒丸、そうでなければ黒の枠線に中が白の円で表示されます。"),nr("br"),
        )
    }
}