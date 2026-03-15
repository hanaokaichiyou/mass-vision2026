import { sceneFrames } from "./Frames"
import PersonsCanvas from "../components/canvas/personsCanvas"
import { countState } from "./count"

export default class ManualPlayer {
    personsCanvas: PersonsCanvas
    constructor(personsCanvas: PersonsCanvas){
        this.personsCanvas = personsCanvas
    }

    play(fpc: number,sceneFrames: sceneFrames[],startSceneNum = 0){
        if(sceneFrames.length === 0) return new Promise<void>(resolve => resolve())
        return new Promise<void>((resolve) => {
            window.onkeydown = e => {
                if(e.key === "ArrowUp")    this.next(),e.preventDefault()
                if(e.key === "ArrowDown")  this.prev(),e.preventDefault()
                if(e.key === "ArrowRight") this.nextScene(),e.preventDefault()
                if(e.key === "ArrowLeft")  this.prevScene(),e.preventDefault()
            }
            let curSceneIndex = 0
            let f = 0
            const drawCurFrame = () => {
                this.personsCanvas.clearAll()
                const frame = sceneFrames[curSceneIndex]?.[f]
                if(frame === undefined) return
                frame.forEach(({state,person}) => {
                    this.personsCanvas.plot(state,person.colorIndex)
                    person.state = state.clone()
                })
            }
            const checkCountChange = () => {
                if(f%fpc === 0){
                    this.onCountChanged({
                        sceneIndex: curSceneIndex + startSceneNum,
                        count: f/fpc
                    })
                }
            }
            this.next = () => {
                f++
                if(f >= sceneFrames[curSceneIndex].length){
                    if(curSceneIndex+1 < sceneFrames.length){
                        f = 0
                        curSceneIndex++
                    }else{
                        f--
                    }
                }
                drawCurFrame()
                checkCountChange()
            }
            this.prev = () => {
                f--
                if(f < 0){
                    if(curSceneIndex > 0){
                        curSceneIndex--
                        f = sceneFrames[curSceneIndex].length-1
                    }else{
                        f++
                    }
                }
                drawCurFrame()
                checkCountChange()
            }
            this.nextScene = () => {
                if(curSceneIndex+1 < sceneFrames.length){
                    curSceneIndex++
                    f = 0
                    drawCurFrame()
                    this.onCountChanged({
                        sceneIndex: curSceneIndex,
                        count: f/fpc
                    })
                }
            }
            this.prevScene = () => {
                if(curSceneIndex > 0){
                    curSceneIndex--
                    f = 0
                    drawCurFrame()
                    this.onCountChanged({
                        sceneIndex: curSceneIndex,
                        count: f/fpc
                    })
                }
            }
            this.pause = ()=>{
                this.stop(resolve)
                this.next = ()=>{}
                this.prev = ()=>{}
                this.nextScene = ()=>{}
                this.prevScene = ()=>{}
                this.pause = ()=>{}
            }
            drawCurFrame()
            this.onCountChanged({
                sceneIndex: curSceneIndex + startSceneNum,
                count: f/fpc
            })
        })
    }
    protected stop(resolve: ()=>void){
        window.onkeydown = ()=>{}
        resolve()
    }
    pause(){
        // define in play()
    }
    next(){
        // define in play()
    }
    prev(){
        // define in play()
    }
    nextScene(){
        // define in play()
    }
    prevScene(){
        // define in play()
    }
    onCountChanged(countState: countState){
        // will be defined in a parent class
        countState
    }
}