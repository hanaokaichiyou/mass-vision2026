import { Narve, nr } from "narve";

export default class SlideEditRootMenu extends Narve.Component {
    deployDestinationBtn = nr("button",{},"目的地を編集")
    linkBtn = nr("button",{},"リンク")
    constructor(){
        super("div",{class: "rootMenuArea"})
        this.children.set(this.deployDestinationBtn,this.linkBtn)
    }
}