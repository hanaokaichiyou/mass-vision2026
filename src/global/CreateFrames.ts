import { message } from "@tauri-apps/plugin-dialog"
import { createFramesFromAction } from "./CreateFramesFromMacro"
import { frame, sceneFrames } from "./Frames"
import PersonState from "./PersonState"
import PointDiff from "./PointDiff"
import Scene from "./Scene"

// シーンの全集合から、[fromScene,toScene]の区間を抜き出し、各シーンをcreateSceneFramesで翻訳する
// [fromScene,toScene] 閉区間
export function createFrames(scenes: Scene[],fpc: number,fromScene?: number,toScene?: number): (sceneFrames)[]|null{
    if(fromScene === undefined) fromScene = 0
    if(toScene === undefined) toScene = scenes.length-1
    if(fromScene < 0 || scenes.length <= fromScene) return null
    if(toScene < 0 || scenes.length <= toScene) return null
    if(fromScene > toScene) return null
    if(scenes.length === 0) return []
    const totalFrames = Array(toScene+1-fromScene).fill(0).map((_,i,arr) => {
        const sceneIndex = i + fromScene
        if(scenes[sceneIndex] === undefined) return null
        const sceneFrames = createSceneFrames(scenes[sceneIndex],fpc,i==arr.length-1)
        return sceneFrames
    })
    if(totalFrames.every((v) => v !== null)){
        return totalFrames
    }else{
        return null
    }
}

// ある特定のシーンのマクロの各actionをcreateFramesFromActionで解釈し、フレームの配列を返す
// 閉区間(最後のシーン)または右半開区間(その他)で返す
function createSceneFrames(scene: Scene, fpc: number,closeSegment: boolean): sceneFrames|null{
    // マクロindexが指定されており、そのindexのマクロが存在するpersonだけでフレームを作る
    console.log("persons",scene.persons)
    let persons = scene.persons
        .filter((p) => p.macroIndex !== undefined && scene.macros[p.macroIndex] !== undefined)

    // カウント数がバラバラなことがあるので、カウント数最大のやつらだけでフレームを作る
    let maxCount = 0
    persons.forEach((person,debug) => {
        if(person.macroIndex === undefined) return // 上のfilterで除去しているのであり得ないが、vscodeのハイライトの問題
        const macro = scene.macros[person.macroIndex]
        maxCount = Math.max(macro.totalCount(person.variables),maxCount)
        if(debug === 0) console.log(macro.macroStr,macro.totalCount(person.variables))
    })
    persons = persons.filter(p => p.macroIndex !== undefined && scene.macros[p.macroIndex].totalCount(p.variables) === maxCount)

    const countNum = maxCount
    const frameNum = fpc * countNum + (closeSegment?1:0)
    console.log("countNum",countNum)
    console.log("actionss", scene.macros)
    let sceneFrames: sceneFrames = Array(frameNum).fill(0).map(_ => [])
    try{ // sceneFramesの長さが十分でないときにエラーを吐くので、それの対策
        persons.forEach((person,debug) => {
            const slides = scene.slides
            // 以下二つはあり得ない
            if(person.macroIndex === undefined) return
            if(person.startState === undefined) return
            let curState = person.startState.clone()
            console.log("id: ",person.id,"curState(start): ",curState)
            let personalFrames:frame = []
            scene.macros[person.macroIndex].actions.forEach(action => {
                const [frames,newState] = createFramesFromAction(action,curState,fpc,slides,person)
                if(debug === 0) console.log("frames",frames)
                personalFrames.push(...frames.map(state => {
                    return {
                        state: state.clone(),
                        person: person
                    }
                }))
                curState = newState.clone()
            })

            // createFramesFromActionの返値は右半開区間だが、向き修正のために閉区間にする
            personalFrames.push({
                state: curState.clone(),
                person: person
            })
            // 向きを進行方向に修正
            for(let i = 0;i < personalFrames.length-1;i++){
                // 次フレームへの移動があればその方向を向く
                // 無ければ触らず、もともと設定されていた向きを向く
                const vec = new PointDiff(...personalFrames[i+1].state.pos.sub(personalFrames[i].state.pos).getPair())
                if(vec.length() > 0.0001){ // 移動していれば
                    console.log("moveing vec",vec)
                    personalFrames[i].state.rotateAngle = vec.angle()
                }
            }
            // 閉区間にするべきシーン(最後のシーン)以外では最後のカウントを消し、右半開区間にする
            if(!closeSegment) personalFrames.pop()
            
            // posを整数値に直す
            personalFrames = personalFrames.map(({state,person}) => {
                return {
                    state: new PersonState(state.pos,state.rotateAngle),
                    person: person
                }
            })
            // 全体のやつに追加
            personalFrames.forEach((pair,f) => {
                if(sceneFrames[f] === undefined) throw new Error(`The length of sceneFrames is not enough. Please estimate enough frameNum. currentFrame is ${f}, but the length of sceneFrames is ${sceneFrames.length}`)
                sceneFrames[f].push(pair)
            })
            if(debug === 6)console.log("personalFrames", personalFrames)
        })
    }catch{
        message("Count estimation error: エラーが発生しました。\nマクロでのカウントの指定に不備がないか確認してください。特に変数でカウントが変わるマクロ式に注意してください。\n最新バージョンにアップデートしても改善しない場合は、開発者に問い合わせてください。")
        return null
    }
    return sceneFrames
}

export function createFirstFrame(scene: Scene): frame{
    return scene.persons.map(person => {
        if(person.startState === undefined) return null
        return {
            state: person.startState,
            person: person
        }
    }).filter(v => v !== null)
}