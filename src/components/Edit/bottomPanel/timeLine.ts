import { Narve } from "narve";
import MassBar from "./timeLine/massBar";
import "./style/timeLine.css"
import SlowBar from "./timeLine/slowBar";

export default class TimeLine extends Narve.Component {
    slowBar = new SlowBar()
    massBar = new MassBar()
    constructor(){
        super("div",{class: "timeLine"})
        this.children.set(this.slowBar,this.massBar,)
    }
}