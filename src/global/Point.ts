import PointDiff from "./PointDiff"

export default class Point {
    x: number
    y: number
    constructor(x: number,y: number){
        this.x = x
        this.y = y
    }
    // 移動処理 破壊的メソッド
    set(point: Point|[number,number]){
        if(Array.isArray(point)){
            this.x = point[0]
            this.y = point[1]
        }else{
            this.x = point.x
            this.y = point.y
        }
    }
    move(diff: PointDiff|[number,number]){
        if(Array.isArray(diff)){
            this.x += diff[0]
            this.y += diff[1]
        }else{
            this.x += diff.x
            this.y += diff.y
        }
    }
    revolve(angle: number, center: Point = new Point(0,0)){
        this.set(this.toRevolved(angle,center))
    }
    closer(point: Point,dr: number){
        const angle = this.angle(point)
        const diff = new PointDiff(dr,0).toRevolved(angle)
        this.move(diff)
    }
    symmetry(theta: number,center: Point,useRad?: boolean){
        this.set(this.toSymmetry(theta,center,useRad))
    }
    // 計算処理 非破壊的メソッド
    mul(vec: [[number,number],[number,number]]|number){
        if(typeof vec === "number"){
            return new Point(this.x*vec,this.y*vec)
        }else{
            const X = vec[0][0] * this.x + vec[0][1] * this.y
            const Y = vec[1][0] * this.x + vec[1][1] * this.y
            return new Point(X,Y)
        }
    }
    add(diff: PointDiff|Point|[number,number]){
        if(Array.isArray(diff)){
            return new Point(this.x+diff[0],this.y+diff[1])
        }else{
            return new Point(this.x+diff.x,this.y+diff.y)
        }
    }
    sub(diff: PointDiff|Point|[number,number]){
        if(Array.isArray(diff)){
            return new Point(this.x - diff[0],this.y - diff[1]) 
        }else{
            return new Point(this.x - diff.x,this.y - diff.y)
        }
    }
    toRevolved(angle: number,center: Point = new Point(0,0)){
        const rad = angle * (Math.PI / 180)
        return this.sub(center)
            .mul([
                [Math.cos(rad),Math.sin(rad)],
                [-Math.sin(rad),Math.cos(rad)]
            ])
            .add(center)
    }
    distance(point: Point){
        return this.sub(point).toDiff().length()
    }
    toCloser(point: Point,dr: number){
        const angle = this.angle(point)
        const diff = new PointDiff(dr,0).toRevolved(angle)
        return this.add(diff)
    }
    toSymmetry(theta: number,center: Point, useRad?: boolean){
        if(!useRad) theta = theta * Math.PI / 180

        const cos = Math.cos(2*theta)
        const sin = Math.sin(2*theta)
        return this.sub(center).mul([
            [cos,sin],
            [sin,-cos]
        ]).add(center)
    }
    rad(point: Point){
        return Math.atan2(-point.y + this.y,point.x - this.x)
    }
    angle(point: Point){
        return this.rad(point)*180/Math.PI
    }
    nearest(){
        return new Point(Math.round(this.x),Math.round(this.y))
    }
    nearestGrid(quarity: number){
        return new Point(Math.round(this.x/quarity)*quarity,Math.round(this.y/quarity)*quarity)
    }
    clone(){// deep copy
        return new Point(this.x,this.y)
    }
    toDiff(){
        return new PointDiff(this.x,this.y)
    }
    getPair(): [number,number]{
        return [this.x,this.y]
    }
}