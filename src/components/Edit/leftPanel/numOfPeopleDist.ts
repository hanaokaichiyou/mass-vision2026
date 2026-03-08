import { Narve, nr } from "narve";

export default class NumOfPeopleDisp extends Narve.Component {
    disp = nr("p")
    constructor(){
        super()
        this.children.set(this.disp)
    }
    setNum(num: number){
        this.disp.setInnerText(num.toString())
    }
}