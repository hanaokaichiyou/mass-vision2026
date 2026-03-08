import Person from "./Person"
import Point from "./Point"

export default class Slide {
    links: Link[] = []
    constructor(links?: Link[]){
        if(links !== undefined){
            links = links
        }
    }
}
export class Link {
    person: Person|undefined = undefined
    absPos: Point
    constructor(absPos: Point,person?: Person){
        this.person = person
        this.absPos = absPos
    }
}