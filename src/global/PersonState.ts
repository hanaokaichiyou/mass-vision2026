import Point from "./Point"

export default class PersonState {
    pos: Point
    /**
     * @param rotateAngle 単位が度なので回転時はradに変換する
     */
    rotateAngle: number
    constructor(pos: Point,rotateAngle: number){
        this.pos = pos.nearest()
        this.rotateAngle = rotateAngle
    }
    clone(){
        return new PersonState(this.pos,this.rotateAngle)
    }
}
export class AccuratePersonState extends PersonState {
    constructor(pos: Point,rotateAngle: number){
        super(pos,rotateAngle)
        this.pos = pos
    }
    clone(): AccuratePersonState {
        return new AccuratePersonState(this.pos,this.rotateAngle)
    }
}