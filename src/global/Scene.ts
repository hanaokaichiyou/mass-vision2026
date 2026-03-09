import { SlowSegments } from "../components/Edit/bottomPanel/timeLine/slowBar";
import Macro from "./Macro";
import Person from "./Person";
import Slide from "./Slide";

export default class Scene {
    macros: Macro[] = []
    slides: Slide[] = []
    persons: Person[] = []
    slowSegments: SlowSegments = new Map()

    constructor(){
        
    }
}