import { Narve, nr } from "narve";

export class RightPanelWindows extends Narve.Component {
    focusingComponent: Narve.Component = nr()
    constructor(){
        super()
    }
    switchFocus(component: Narve.Component, display?: string): void {
        super.switchFocus(component,display)
        this.focusingComponent = component
    }
    
}