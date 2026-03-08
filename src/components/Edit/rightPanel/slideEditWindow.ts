import { Narve, nr } from "narve";
import SlideEditRootMenu from "./slideEditWindow/slideEditRootMenu";
import "./style/SlideEditWindow.css"
import DeployBtns from "./deployBtns";
import Scene from "../../../global/Scene";
import { UndoFunc } from "../../../global/Undo";
import Slide from "../../../global/Slide";

export default class SlideEditWindow extends Narve.Component {
    scene: Scene|undefined

    rootMenu = new SlideEditRootMenu()
    deployDestination = new DeployBtns()
    windows = nr("div",{class: "windows"},this.rootMenu,this.deployDestination)
    slideIndexSelect = nr<HTMLSelectElement>("select")
    addSlideBtn = nr("button",{},"+　スライドを追加")

    constructor(){
        super("div",{class: "slideEditWindow"})
        this.children.set(this.slideIndexSelect,this.addSlideBtn,this.windows)

        this.windows.switchFocus(this.rootMenu)
        this.deployDestination.elem.oncontextmenu = e => {
            e.stopPropagation()
            e.preventDefault()
            this.windows.switchFocus(this.rootMenu)
        }
        this.rootMenu.deployDestinationBtn.elem.onclick = () => this.windows.switchFocus(this.deployDestination)

        this.addSlideBtn.elem.onclick = () => this.addNewSlide()
        
        // これいるんかな↓
        this.slideIndexSelect.elem.onchange = () => this.setSlideIndex(this.slideIndexSelect.elem.selectedIndex)
    }
    setScene(scene: Scene){
        this.scene = scene
        this.reloadSelect()
    }
    reloadSelect(){
        if(this.scene === undefined) this.slideIndexSelect.children.set()
        else
        this.slideIndexSelect.children.set(
            ...this.scene.slides.map((_,index) => 
                // Warning スライド番号とスライドindexは異なる
                nr("option",{},`スライド${index+1}`)
            )
        )
    }
    setSlideIndex(index: number){
        this.slideIndexSelect.elem.selectedIndex = index
        const slide = this.scene?.slides[index]
        if(slide === undefined) return
        this.drawSlide(slide)
    }
    addNewSlide(){
        if(this.scene === undefined) return
        this.scene.slides.push(new Slide())
        this.reloadSelect()
        const index = this.scene.slides.length-1
        this.setSlideIndex(index)
        this.pushUndo({
            do: () => {
                if(this.scene === undefined) return
                this.scene.slides.push(new Slide())
                this.reloadSelect()
                const index = this.scene.slides.length-1
                this.setSlideIndex(index)
            },
            undo: () => {
                if(this.scene === undefined) return
                this.scene.slides.pop()
                this.reloadSelect()
                const index = this.scene.slides.length-1
                this.setSlideIndex(index)
            }
        })
    }
    getFocusingSlideIndex(){
        return this.slideIndexSelect.elem.selectedIndex
    }
    pushUndo(...func: UndoFunc[]){
        func// define in project://src/App.ts
    }
    drawSlide(slide: Slide){
        slide
        // define in project://src/components/Edit.ts
    }
}