import { sceneFrames } from "./Frames"
import PersonsCanvas from "../components/canvas/personsCanvas"
import { countState } from "./count"
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

    play(fpc: number,cpm: number,sceneFrames: sceneFrames[]){
        // シーンが0個だったらreturn null
        if(sceneFrames.length === 0) return new Promise<void>(resolve => resolve())
        const fps = fpc * cpm / 60
        return new Promise<void>((resolve) => {
            this.pause = ()=>{
                this.stop(resolve)
                this.pause = ()=>{}
            }
            let curSceneIndex = 0
            let f = 0
            this.playingInterval = setInterval(() => {
                this.personsCanvas.clearAll()
                const frame = sceneFrames[curSceneIndex]?.[f]
                if(frame === undefined) return
                
                frame.forEach(({state,person}) => {
                    this.personsCanvas.plot(state,person.colorIndex)
                    person.state = state.clone()
                })
                if(f%fpc === 0){
                    this.onCountChanged({
                        sceneIndex: curSceneIndex,
                        count: f/fpc
                    })
                }
                f++
                if(f >= sceneFrames[curSceneIndex].length){
                    f = 0
                    curSceneIndex++
                }
                if(curSceneIndex >= sceneFrames.length){
                    this.stop(resolve)
                    return
                }
            },1000/fps)
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