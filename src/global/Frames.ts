import Person from "./Person"
import PersonState from "./PersonState"

export type sceneFrames = frame[]
export type frame = {
    statePersonPairs: statePersonPair[]
    isSubFrame: boolean
}
export type statePersonPair = {
    state: PersonState
    person: Person
    isLarge?: boolean
}
