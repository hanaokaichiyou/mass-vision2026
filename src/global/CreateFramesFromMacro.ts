import { message } from "@tauri-apps/plugin-dialog"
import { action, move_back, move_dyclon, move_liner, move_revolve } from "./Macro"
import { massCanvasDef } from "./massCanvasDef"
import Person from "./Person"
import PersonState, { AccuratePersonState } from "./PersonState"
import Point from "./Point"
import Slide from "./Slide"

// 与えられたactionを解釈し、そのフレーム配列を返す
// フレームは右半開区間[left,right)で作成する
// これにより区間同士の結合が簡単になる
// 最後のフレームだけ追加することで閉区間になる

/**
 * 
 * @param action 
 * @param curState 
 * @param fpc 
 * @param slides 
 * @param id 
 * @returns [(右半開区間のフレーム配列),(最後のstate)]
 * @returns slidesでslideIndex番目が見つからなかったり、idが見つからなかったら[[],curState.clone()]を返す
 * @returns フレーム配列のstate.posは後からの向き修正のためにスライド系は小数を許可する
 */
export function createFramesFromAction(action: action, curState: PersonState,fpc: number,slides: Slide[],person: Person): [AccuratePersonState[],AccuratePersonState]{
    let frameNum: number
    try{
        frameNum = fpc * action.count.evaluate(person.variables,true)
        if(frameNum < 0) throw new Error("")
    }catch{
        message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
        return [[],curState]
    }
    switch(action.move.type){
        case "break":   return createBreakFrames(curState,frameNum)
        case "liner":   return createLinerFrames(action.move,curState,frameNum,person)
        case "back":    return createBackFrames(action.move,curState,frameNum,person)
        case "rotate":  
            let rotateAngle: number
            try{
                rotateAngle = action.move.rotateAngle.evaluate(person.variables,true) * (person.reverseFlag?-1:1)
            }catch{
                message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
                return [[],curState]
            }
            return [[],new PersonState(curState.pos,curState.rotateAngle + rotateAngle)]
        case "revolve": return createRevolveFrames(action.move,curState,frameNum,person)
        case "slide":
            const absPos = slides[action.move.slideIndex.evaluate(person.variables,true)]?.links.find(v => v.person === person)?.absPos
            if(absPos === undefined){
                return [[],curState.clone()]
            }
            return createSlideFrames(absPos,curState,frameNum)
        case "dyclon":  return createDyclonFrames(action.move,curState,frameNum,person)
        case "sit": return createSitFrames(curState,frameNum)
        case "stand": return createStandFrames(curState,frameNum)
    }
}

// HACK Array(n).fill(0).map((_,i) => ...) みたいな構文はPythonでいうrangeみたいの代わり
// fill(0)があるのはこれがないと、全要素の参照が同じになって一つ変更したら全部変わっちゃうから

// posは整数
export function createBreakFrames(curState: PersonState,frameNum: number): [PersonState[],PersonState]{
    return [Array(frameNum).fill(0).map(_ => curState.clone()),curState.clone()]
}
// posは整数
export function createLinerFrames(move: move_liner,curState: PersonState,frameNum: number,person: Person): [PersonState[],PersonState]{
    let dcell: number
    try{
        dcell = move.dcell.evaluate(person.variables) // dcellは小数OK
    }catch{
        message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
        return [[],curState]
    }

    // MEMO 45度単位なので四捨五入で問題なし(切り上げだとcos,sinが負のときに0になる)
    // MEMO 座標系が一般的なxy座標系と異なり、y軸が下向きに取られていることに注意
    const cos = Math.round(Math.cos(curState.rotateAngle*Math.PI/180))
    const sin = -Math.round(Math.sin(curState.rotateAngle*Math.PI/180))
    const dx = dcell*cos*massCanvasDef.quarity
    const dy = dcell*sin*massCanvasDef.quarity
    const ddx = dx/frameNum
    const ddy = dy/frameNum
    
    return [Array(frameNum).fill(0).map((_,i) => {
        const f = i // [0,frameNum)の範囲でフレームを作成するので整数の範囲では[0,frameNum-1]
        return new PersonState(
                curState.pos.add([ddx*f,ddy*f]),
                curState.rotateAngle
            )
        }
    ),new PersonState(curState.pos.add([dx,dy]),curState.rotateAngle)]
}
// posは整数
export function createBackFrames(move: move_back,curState: PersonState,frameNum: number,person: Person): [PersonState[],PersonState]{
    let dcell: number
    try{
        dcell = -move.dcell.evaluate(person.variables) // dcellは小数OK。backWalkなのでdcellは逆になる
    }catch{
        message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
        return [[],curState]
    }

    // MEMO 45度単位なので四捨五入で問題なし(切り上げだとcos,sinが負のときに0になる)
    // MEMO 座標系が一般的なxy座標系と異なり、y軸が下向きに取られていることに注意
    const cos = Math.round(Math.cos(curState.rotateAngle*Math.PI/180))
    const sin = -Math.round(Math.sin(curState.rotateAngle*Math.PI/180))
    const dx = dcell*cos*massCanvasDef.quarity
    const dy = dcell*sin*massCanvasDef.quarity
    const ddx = dx/frameNum
    const ddy = dy/frameNum
    
    return [Array(frameNum).fill(0).map((_,i) => {
        const f = i // [0,frameNum)の範囲でフレームを作成するので整数の範囲では[0,frameNum-1]
        return new PersonState(
                curState.pos.add([ddx*f,ddy*f]),
                curState.rotateAngle
            )
        }
    ),new PersonState(curState.pos.add([dx,dy]),curState.rotateAngle)]
}
// posは小数許可
export function createRevolveFrames(move: move_revolve,curState: PersonState,frameNum: number,person: Person): [AccuratePersonState[],AccuratePersonState]{
    let revolveAngle: number
    try{
        revolveAngle = move.revolveAngle.evaluate(person.variables,false)
    }catch{
        message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
        return [[],curState]
    }
    const dRevolveTheta = frameNum !== 0 ? revolveAngle / frameNum : 0
    // HACK y座標は上下逆
    const startRotateTheta = curState.pos.angle(move.center) + (revolveAngle>=0?-90:90) // 最後の±90は最初の向きが接線方向だから(半径⊥接線)

    return [Array(frameNum).fill(0).map((_,i) => {
        const f = i
        const theta = dRevolveTheta*f
        return new AccuratePersonState(
            curState.pos.toRevolved(theta,move.center),
            startRotateTheta + theta
        )
    }),new AccuratePersonState(curState.pos.toRevolved(revolveAngle,move.center),startRotateTheta+revolveAngle)]
}
// posは小数許可
export function createSlideFrames(absPos: Point,curState: PersonState,frameNum: number): [AccuratePersonState[],AccuratePersonState]{
    const relMove = absPos.sub(curState.pos).toDiff()
    const dxy = relMove.mul(frameNum !== 0 ? 1/frameNum : 0)
    const rotateAngle = relMove.length() > 0.0001?
        relMove.angle() :
        curState.rotateAngle
    return [Array(frameNum).fill(0).map((_,i) => {
        const f = i
        return new AccuratePersonState(curState.pos.add(dxy.mul(f)),rotateAngle)
    }),new AccuratePersonState(curState.pos.add(relMove),rotateAngle)]
}
// posは小数許可。向きは後から指定するのでNaNを代入
export function createDyclonFrames(move: move_dyclon,curState: PersonState,frameNum: number,person: Person): [AccuratePersonState[],AccuratePersonState]{
    let lastR: number
    try{
        lastR = move.lastRaius.evaluate(person.variables,false)
        if(lastR < 0) throw new Error("")
    }catch{
        message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
        return [[],curState]
    }
    let revolveAngle: number
    try{
        revolveAngle = move.revolveAngle.evaluate(person.variables,false)
    }catch{
        message("マクロの解析エラーです。マクロまたは変数設定に誤りがある可能性があります。")
        return [[],curState]
    }
    const R = curState.pos.distance(move.center)
    const center = move.center
    
    const rate = R/lastR
    const numOfFormerFrames = Math.round(frameNum * rate)
    const dTheta = frameNum !== 0 ? revolveAngle / frameNum : 0
    const dr = frameNum !== 0 ? lastR/frameNum : 0

    const lastPos = curState.pos.toCloser(center,-lastR+R).toRevolved(revolveAngle * rate,center)
    const lastRotateAngle = lastPos.angle(center) + 90 + (revolveAngle>=0?1:-1)// 接線⊥半径
    return [Array(frameNum).fill(0).map((_,i) => {
        let newPos = curState.pos.clone()
        const f = i

        if(f > numOfFormerFrames){
            const newR = dr*f
            // TODO 式の導出書く
            // MEMO 式の導出については別ファイル参照(まだ書いてない)
            const theta = revolveAngle * (R-newR) /  newR
            newPos = curState.pos.toCloser(center,-newR+R).toRevolved(theta,center)
        }
        // ここはずっと同じ(これがあることで、上の処理を回転を止めたときと同じように書くことができる)
        newPos.revolve(dTheta*f,center)

        return new AccuratePersonState(newPos,NaN)
    }), new AccuratePersonState(lastPos,lastRotateAngle)]
}
export function createSitFrames(curState: PersonState,frameNum: number): [PersonState[],PersonState]{
    // MEMO 45度単位なので四捨五入で問題なし(切り上げだとcos,sinが負のときに0になる)
    // MEMO 座標系が一般的なxy座標系と異なり、y軸が下向きに取られていることに注意
    const dcell = -1/8
    const cos = Math.cos(curState.rotateAngle*Math.PI/180)
    const sin = -Math.sin(curState.rotateAngle*Math.PI/180)
    const dx = dcell*cos*massCanvasDef.quarity
    const dy = dcell*sin*massCanvasDef.quarity
    const ddx = dx/frameNum
    const ddy = dy/frameNum
    
    return [Array(frameNum).fill(0).map((_,i) => {
        const f = i // [0,frameNum)の範囲でフレームを作成するので整数の範囲では[0,frameNum-1]
        return new PersonState(
                curState.pos.add([ddx*f,ddy*f]),
                curState.rotateAngle
            )
        }
    ),new PersonState(curState.pos.add([dx,dy]),curState.rotateAngle)]
}
export function createStandFrames(curState: PersonState,frameNum: number): [PersonState[],PersonState]{
    // MEMO 45度単位なので四捨五入で問題なし(切り上げだとcos,sinが負のときに0になる)
    // MEMO 座標系が一般的なxy座標系と異なり、y軸が下向きに取られていることに注意
    const dcell = 1/8
    const cos = Math.cos(curState.rotateAngle*Math.PI/180)
    const sin = -Math.sin(curState.rotateAngle*Math.PI/180)
    const dx = dcell*cos*massCanvasDef.quarity
    const dy = dcell*sin*massCanvasDef.quarity
    const ddx = dx/frameNum
    const ddy = dy/frameNum
    
    return [Array(frameNum).fill(0).map((_,i) => {
        const f = i // [0,frameNum)の範囲でフレームを作成するので整数の範囲では[0,frameNum-1]
        return new PersonState(
                curState.pos.add([ddx*f,ddy*f]),
                curState.rotateAngle
            )
        }
    ),new PersonState(curState.pos.add([dx,dy]),curState.rotateAngle)]
}


// export function createGenRevolve(numOfFrames: number,move: move_genRevolve,state: PersonState): PersonState[]{
    // const curState = state.clone()
// 
    // const centerPos = createCenterPos(move.centerMacro,numOfFrames,move.center)
    // const states: PersonState[] = []
    // if(numOfFrames !== centerPos.length){
        // console.warn("genRevolveでcountとcenterMacroのcountが一致しません")
        // return []
    // }
    // const startR = curState.pos.distance(move.center)
    // const incR   = move.lastRadius - startR
    // const dr     = incR / numOfFrames
    // const dTheta = move.revolveAngle / numOfFrames
    // Array(numOfFrames).fill(0).forEach((_,i) => {
        // const f = i
        // spinAngleを1フレーム前のやつとの微分で定める
        // let prePos: Point
        // if(i){
            // prePos = states[i-1].pos.clone()
        // }else{
            // prePos = curState.pos.clone()
        // }
        // const newPos = curState.pos
            // .toRevolved(dTheta*f,move.center)// まず回転
            // .toCloser(move.center,-dr*f)// 半径拡大・縮小
            // .add(centerPos[i]) // 中心の移動と同じように平行移動
        // const spinAngle = -prePos.angle(newPos)
        // states.push(new PersonState(
            // newPos,
            // spinAngle
        // ))
    // })
    // return states
// }
// function createCenterPos(macro: Macro,centerStartPos: Point,frameNum: number): Point[]{
    // const centerPos = new Point(0,0)
    // const points: Point[] = []
    // macro.toActions().forEach(act => {
        // if(act.move.type === "liner"){
            // const dCpcell = move.cpcell/frameNum
// 
            // MEMO 45度単位なので四捨五入で問題なし(切り上げだとcos,sinが負のときに0になる)
            // MEMO 座標系が一般的なxy座標系と異なり、y軸が下向きに取られていることに注意
            // const cos = Math.round(Math.cos(centerPos.rotateAngle*Math.PI/180))
            // const sin = -Math.round(Math.sin(centerPos.rotateAngle*Math.PI/180))
            // const ddx = dCpcell*cos*massCanvasDef.quarity/frameNum
            // const ddy = dCpcell*sin*massCanvasDef.quarity/frameNum
            // points.push(...Array(frameNum).fill(0).map((_,i) => {
                // const f = i
                // return centerPos.add(ddx*f,ddy*f)
            // }))
            // centerPos.move(act.move.dx,act.move.dy)
        // }else if(act.move.type === "rotate"){
            // const relativeCenter = act.move.center.sub(...centerStartPos.getPair())
            // const dTheta = act.move.angle / frameNum
            // points.push(...Array(frameNum).fill(0).map((_,i) => {
                // const f = i
                // return centerPos.toRevolved(dTheta*f,relativeCenter)
            // }))
            // centerPos.rotate(act.move.angle)
        // }
    // })
    // return points
// }

