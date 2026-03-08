import { Narve } from "narve";

export default class MusicPlayer extends Narve.Component<HTMLAudioElement>{
    constructor(){
        super("audio")
        this.elem.src = ""
    }
    setSrc(src: string){ 
        this.elem.src = src
    }
    play(){
        this.elem.play()
    }
    pause(){
        this.elem.pause()
    }
}