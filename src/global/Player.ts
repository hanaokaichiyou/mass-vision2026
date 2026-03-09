import { sceneFrames } from "./Frames"
import PersonsCanvas from "../components/canvas/personsCanvas"
import { countState } from "./count"
import { SlowSegments } from "../components/Edit/bottomPanel/timeLine/slowBar"
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

    play(fpc: number,defaultCpm: number,sceneFramess: sceneFrames[],startSceneNum: number,slowSegmentss: SlowSegments[]){
        // シーンが0個だったらreturn null
        if(sceneFramess.length === 0) return new Promise<void>(resolve => resolve())
        const defaultFps = fpc * defaultCpm / 60
        return new Promise<void>((resolve) => {
            this.pause = ()=>{
                this.stop(resolve)
                this.pause = ()=>{}
            }
            // 各フレームが表示されるべき時刻を計画する(...ArrはtimeToDrawの一部という意味)
            let timeToDraw: number[][] = []
            for(let scene_i = 0; scene_i < sceneFramess.length; scene_i++){
                const defaultInterval = 1000/defaultFps
                let sceneArr = sceneFramess[scene_i].map(_=> defaultInterval)
                if(scene_i === 0){
                    sceneArr[0] = 0
                }else{
                    const lastSceneArr = timeToDraw[scene_i-1]
                    sceneArr[0] += lastSceneArr[lastSceneArr.length-1]
                }
                if(slowSegmentss[scene_i] !== undefined){
                    slowSegmentss[scene_i].forEach(slowSegments => {
                        // 区間の「間」の時間が遅くなるので、let i = ...「+1」になる
                        for(let i = slowSegments.seg[0]+1; i <= slowSegments.seg[1]; i++){
                            sceneArr[i] = 1000 / (fpc * slowSegments.cpm / 60)
                        }
                    })
                }
                console.log("scene", scene_i,[...sceneArr])
                for(let i = 0; i < sceneArr.length-1; i++){
                    sceneArr[i+1] += sceneArr[i]
                }
                timeToDraw.push(sceneArr)
            }
            const start = Date.now()
            let curSceneIndex = 0
            let f = 0
            
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
                    this.stop(resolve)
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