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

                if(slowSegmentss[scene_i] !== undefined){
                    slowSegmentss[scene_i].forEach(slowSegments => {
                        // 区間の「間」の時間が遅くなるので、let i = ...「+1」になる
                        for(let i = slowSegments.seg[0]+1; i <= slowSegments.seg[1] + (segPlus1?1:0); i++){
                            if(i < sceneArr.length){
                                sceneArr[i] = 1000 / (fpc * slowSegments.cpm / 60)
                            }else if(scene_i+1 < timeToDraw.length){
                                timeToDraw[scene_i+1][i-sceneArr.length] = 1000 / (fpc * slowSegments.cpm / 60)
                            }
                        }
                    })
                }
                console.log("scene", scene_i,[...sceneArr])
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
                // TODO 音楽の再生開始位置調整
            }

            const start = Date.now()
            let curSceneIndex = 0
            let f = 0
            
            this.pause = ()=>{
                this.stop(resolve)
                stopMusic()
                this.pause = ()=>{}
            }
            this.playingInterval = setInterval(() => {
                const cur = Date.now() - start
                // 計画した時間が来るまで待つ
                if(cur < timeToDraw[curSceneIndex][f]) return

                this.personsCanvas.clearAll()
                const frame = sceneFramess[curSceneIndex]?.[f]
                if(frame === undefined) return
                
                frame.forEach(({state,person}) => {
                    this.personsCanvas.plot(state,person.colorIndex)
                    person.state = state.clone()
                })
                if(f%fpc === 0){
                    this.onCountChanged({
                        sceneIndex: startSceneNum + curSceneIndex,
                        count: f/fpc
                    })
                }
                f++
                if(f >= sceneFramess[curSceneIndex].length){
                    f = 0
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