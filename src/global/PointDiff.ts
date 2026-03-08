export default class PointDiff {
    x: number
    y: number
    constructor(x: number,y: number){
        this.x = x
        this.y = y
    }
    // 移動処理 破壊的メソッド
    set(diff: PointDiff|[number,number]){
        if(Array.isArray(diff)){
            this.x = diff[0]
            this.y = diff[1]
        }else{
            this.x = diff.x
            this.y = diff.y
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
    revolve(angle: number){
        this.set(this.toRevolved(angle))
    }
    // 計算処理 非破壊的メソッド
    mul(vec: [[number,number],[number,number]]|number){
        if(typeof vec === "number"){
            return new PointDiff(this.x*vec,this.y*vec)
        }else{
            const X = vec[0][0] * this.x + vec[0][1] * this.y
            const Y = vec[1][0] * this.x + vec[1][1] * this.y
            return new PointDiff(X,Y)
        }
    }
    add(diff: PointDiff|[number,number]){
        if(Array.isArray(diff)){
            return new PointDiff(this.x+diff[0],this.y+diff[1])
        }else{
            return new PointDiff(this.x+diff.x,this.y+diff.y)
        }
    }
    sub(diff: PointDiff){
        if(Array.isArray(diff)){
            return new PointDiff(this.x-diff[0],this.y-diff[1])
        }else{
            return new PointDiff(this.x-diff.x,this.y-diff.y)
        }
    }
    toRevolved(angle: number){
        const rad = angle * (Math.PI / 180)
        return this.mul([
            [Math.cos(rad),Math.sin(rad)],
            [-Math.sin(rad),Math.cos(rad)]
        ])
    }
    rad(){
        return Math.atan2(-this.y,this.x)
    }
    angle(){
        return this.rad()*180/Math.PI
    }
    length(){
        return Math.sqrt(this.x**2+this.y**2)
    }
    nearest(){
        return new PointDiff(Math.round(this.x),Math.round(this.y))
    }
    nearestGrid(quarity: number){
        return new PointDiff(Math.round(this.x/quarity)*quarity,Math.round(this.y/quarity)*quarity)
    }
    clone(){// deep copy
        return new PointDiff(this.x,this.y)
    }
    getPair(): [number,number]{
        return [this.x,this.y]
    }
}