import { Narve } from "narve";

export default class MusicPlayer extends Narve.Component<HTMLAudioElement>{
    src: string
    constructor(){
        super("audio")
        this.src = ""
        this.elem.src = ""
    }
    setSrc(src: string){ 
        this.elem.src = this.src = src
    }
    play(){
        this.elem.currentTime = 0
        this.elem.play()
    }
    pause(){
        this.elem.pause()
    }
}