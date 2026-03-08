import { massCanvasDef as ms } from "./massCanvasDef"
import Point from "./Point"
import PersonState from "./PersonState"

export default class Person {
    macroIndex: number|undefined = undefined
    startState: PersonState

    state = new PersonState(new Point(0,0),ms.defRotateAngle)
    inDisplay = false
    colorIndex = 0
    // MEMO idは1based
    id: number
    variables: ms.Variables = ms.defVars()

    constructor(point: Point,id: number){
        this.id = id
        this.startState = new PersonState(point,ms.defRotateAngle)
        this.state.pos.set(point)
    }
    display(){
        // これ上から操作せんといけんやつ
        this.inDisplay = true
    }
    hide(){
        this.inDisplay = false
    }
    setStartState(state: PersonState){
        this.startState = state.clone()
    }
    setMacroIndex(macroIndex: number){
        this.macroIndex = macroIndex
    }
    clone(id: number){
        const person = new Person(new Point(0,0),id)
        person.macroIndex = this.macroIndex
        person.startState = this.startState.clone()
        person.state = this.state.clone()
        person.inDisplay = this.inDisplay
        person.colorIndex = this.colorIndex
        return person
    }
}
