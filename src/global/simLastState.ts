import { createFramesFromAction } from "./CreateFramesFromMacro"
import Person from "./Person"
import Scene from "./Scene"

export default function simLastState(person: Person,scene: Scene){
    let curState = person.startState.clone()
    if(person.macroIndex !== undefined && scene.macros[person.macroIndex] !== undefined){
        const macro = scene.macros[person.macroIndex]
        macro.actions.forEach(action => {
            const [_,newState] = createFramesFromAction(action,curState,0,scene.slides,person)
            curState = newState.clone()
        })
    }
    curState.pos = curState.pos.nearest()
    return curState
}