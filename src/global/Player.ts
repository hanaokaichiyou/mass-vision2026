import { sceneFrames } from "./Frames"
import PersonsCanvas from "../components/canvas/personsCanvas"
import { countState } from "./count"
import { SlowSegments } from "../components/Edit/bottomPanel/timeLine/slowBar"
import { StartCounts } from "../components/Edit/bottomPanel/timeLine"
export default class Player {
    personsCanvas: PersonsCanvas
    playingInterval: NodeJS.Timeout|undefined
    // errorMessage = {
    //     "macroUndefined": "マクロが設定されていない人がいます。",
    //     "countUnFlat": "カウント数が一致しません",
    // }
    constructor(personsCanvas: PersonsCanvas){
        this.personsCanvas = personsCanvas
    }

    play(fpc: number,defaultCpm: number,sceneFramess: sceneFrames[],startSceneNum: number,slowSegmentss: SlowSegments[],segPlus1: boolean,startCounts: StartCounts,startMusic: () => void,stopMusic: () => void){
        // シーンが0個だったらreturn null
        if(sceneFramess.length === 0) return new Promise<void>(resolve => resolve())
        const defaultFps = fpc * defaultCpm / 60
        return new Promise<void>(async (resolve) => {
            let killFlag = false
            this.pause = () => {
                killFlag = true
                stopMusic()
            }
            // 各フレームが表示されるべき時刻を計画する(...ArrはtimeToDrawの一部という意味)
            const defaultInterval = 1000/defaultFps
            let timeToDraw: number[][] = sceneFramess.map(sceneFrames => sceneFrames.map(_=>defaultInterval))
            for(let scene_i = 0; scene_i < sceneFramess.length; scene_i++){
                const sceneArr = timeToDraw[scene_i] // HACK シャローコピーして添え字をつけなくてよくする

                // MEMO サブフレームは次にある非サブフレームまでの時間を等分する
                if(slowSegmentss[scene_i] !== undefined){
                    slowSegmentss[scene_i].forEach(slowSegment => {
                        // 区間の「間」の時間が遅くなるので、let i = ...「+1」になる
                        let subCount = 0
                        for(let i = slowSegment.seg[0]+1; i <= slowSegment.seg[1] + (segPlus1?1:0); i++){
                            // Warning シーンを二つ超えるとバグる
                            if(i < sceneArr.length){
                                if(sceneFramess[scene_i][i].isSubFrame){
                                    subCount++
                                }else{
                                    for(let _i = i-subCount; _i <= i; _i++){
                                        sceneArr[_i] = 1000 / (fpc * slowSegment.cpm / 60) / (subCount+1)
                                    }
                                    subCount = 0
                                }
                            }else if(scene_i+1 < timeToDraw.length){
                                if(sceneFramess[scene_i+1][i-sceneArr.length] === undefined)
                                    console.log("sceneFramess(",scene_i+1,i-sceneArr.length,") is undefined")
                                if(sceneFramess[scene_i+1][i-sceneArr.length].isSubFrame){
                                    subCount++
                                }else{
                                    for(let _i = i-subCount; _i <= i; _i++){
                                        const dTime = 1000 / (fpc * slowSegment.cpm / 60) / (subCount+1)
                                        if(_i < sceneArr.length){
                                            timeToDraw[scene_i][_i] = dTime
                                        }else{
                                            timeToDraw[scene_i+1][_i-sceneArr.length] = dTime
                                        }
                                    }
                                    subCount = 0
                                }
                            }
                        }
                    })
                }
            }
            // 累積する
            for(let scene_i = 0; scene_i < timeToDraw.length; scene_i++){
                if(scene_i === 0) timeToDraw[scene_i][0] = 0
                else timeToDraw[scene_i][0] += timeToDraw[scene_i-1][timeToDraw[scene_i-1].length-1]
                for(let frame_i = 1; frame_i < timeToDraw[scene_i].length; frame_i++){
                    timeToDraw[scene_i][frame_i] += timeToDraw[scene_i][frame_i-1]
                }
            }
            if(killFlag) return resolve()
            // 音楽は非同期で待つ
            if(startSceneNum === 0){// 最初のシーンならマスと音楽の再生開始位置調整
                setTimeout(() => {
                    if(!killFlag) startMusic()
                },1000*startCounts.musicStartCount/defaultFps*fpc)

                // マスは同期で待つ(ネストを浅くするため)
                await new Promise(resolve => setTimeout(resolve,1000*startCounts.massStartCount/defaultFps*fpc))
                if(killFlag) return resolve()
            }else{// 最初のシーンでないなら再生しない(将来的には再生開始位置調整したい)
                // TODO 音楽の再生開始位置調整して途中からのシーンでも再生できるように
            }

            const start = Date.now()
            let curSceneIndex = 0
            let f = 0 // 表示されるフレームインデックス
            let i = 0 // 補フレームを含めたフレームのインデックス
            
            this.pause = ()=>{
                this.stop(resolve)
                stopMusic()
                this.pause = ()=>{}
            }
            this.playingInterval = setInterval(() => {
                const cur = Date.now() - start
                // 計画した時間が来るまで待つ
                if(cur < timeToDraw[curSceneIndex][i]) return

                this.personsCanvas.clearAll()
                const frame = sceneFramess[curSceneIndex]?.[i]
                if(frame === undefined) return
                
                frame.statePersonPairs.forEach(({state,person,isLarge}) => {
                    this.personsCanvas.plot(state,person.colorIndex,person.id,isLarge)
                    person.state = state.clone()
                })
                if(f%fpc === 0){
                    this.onCountChanged({
                        sceneIndex: startSceneNum + curSceneIndex,
                        count: f/fpc
                    })
                }
                if(!frame.isSubFrame) f++
                
                i++
                if(i >= sceneFramess[curSceneIndex].length){
                    f = 0
                    i = 0
                    curSceneIndex++
                }
                if(curSceneIndex >= sceneFramess.length){
                    this.pause()
                    return
                }
            },1000/defaultFps/10)
        })
    }
    protected stop(resolve: ()=>void){
        if(this.playingInterval !== undefined){
            clearInterval(this.playingInterval)
            window.onkeydown = ()=>{}
            resolve()
        }
    }
    pause(){

    }
    onCountChanged(countState: countState){
        // will be defined in a parent class
        countState
    }
}