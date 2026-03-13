import { Narve, nr } from "narve";
import Edit from "./components/Edit";
import Scene from "./global/Scene";
import createMenu from "./global/Menu";
import Undo from "./global/Undo";
import Player from "./global/Player";
import { createFrames } from "./global/CreateFrames";
import { message } from "@tauri-apps/plugin-dialog";
import simLastState from "./global/simLastState";
import PlayConditions from "./global/playConditions";
import ScenePage from "./components/ScenePage";
import ManualPlayer from "./global/ManualPlayer";
import Person from "./global/Person";
import MusicPlayer from "./global/MusicPlayer";
import BottomPanel from "./components/Edit/bottomPanel";


export default class App extends Narve.Component {
    scenes: Scene[] = []
    edit: Edit
    scenePage = new ScenePage(this.scenes)
    defaultCpm: number = 180
    undo = new Undo()

    currentSceneIdx = 0
    musicPlayer: MusicPlayer = new MusicPlayer()
    player: Player
    manualPlayer: ManualPlayer
    playing = false

    pamphElem: Narve.Component

    pages = nr("div",{class: "pages"})

    segPlus1 = true
    constructor(){
        super("div",{class: "app"})
        this.children.set(this.pages,this.musicPlayer)

        this.edit = new Edit(new Scene(),0)// 形式的に
        this.setScenes([])// こっちが本命

        this.pages.children.set(this.edit,this.scenePage)
        this.pages.switchFocus(this.edit)
        this.edit.elem.style.display = "grid"
        this.pamphElem = Narve.q("#pamphElem")
        console.log(this.pamphElem)

        this.player = new Player(this.edit.editField.personsCanvas)
        this.manualPlayer = new ManualPlayer(this.edit.editField.personsCanvas)

        this.edit.getPrevScene = () => {
            let index: number = this.scenes.findIndex(scene => scene === this.edit.scene)
            return this.scenes[index-1]
        }
        this.edit.resetId = (targetSceneIndex) => this.resetId(targetSceneIndex)
        this.scenePage.onSceneUnitClicked = scene => {
            this.setScene(scene)
            this.pages.switchFocus(this.edit)
            this.edit.elem.style.display = "grid"
        }
        this.scenePage.header.elem.onclick = () => {
            this.pages.switchFocus(this.edit)
            this.edit.elem.style.display = "grid"
        }
    }
    setScenes(scenes: Scene[]){
        this.scenes = scenes
        if(scenes.length === 0) this.scenes.push(new Scene())
            console.log(this.scenes)
        this.setScene(this.scenes[0])

        this.undo = new Undo()
        this.edit.pushUndo = 
        this.edit.rightPanel.macroEditWindow.pushUndo = 
        this.scenePage.pushUndo = (...func) => {
            this.undo.push(...func)
        }
        this.edit.editField.fixLayerCenter()
        this.scenePage.setScenes(this.scenes)
        createMenu(this)
        this.onScenesChanged()
    }
    async setScene(scene: number|Scene){
        const currentScene = this.scenes[this.currentSceneIdx]
        if(currentScene !== undefined){
            if(!PlayConditions.macroOk(currentScene)){
                await message("編集中のシーンにマクロが設定されていない人がいます。")
                return
            }
            if(!PlayConditions.countOk(currentScene)){
                await message("編集中のシーンにカウント数が一致しない人がいます。")
                return
            }
            if(!PlayConditions.countZeroOk(currentScene)){
                await message("編集中のシーンのカウント数が0です。カウント数が0のシーンを作ることはできません。")
                return 
            }
        }
        if(typeof scene === "number"){
            if(this.scenes[scene] === undefined) return
            this.currentSceneIdx = scene
            this.edit.setScene(this.scenes[scene],scene)
            this.edit.editField.fixLayerCenter()
        }else{
            const sceneIndex = this.scenes.indexOf(scene)
            if(sceneIndex === -1) return
            this.currentSceneIdx = sceneIndex
            this.edit.setScene(scene,this.currentSceneIdx)
            this.edit.editField.fixLayerCenter()
        }
        this.edit.rightPanel.idWindow.onSceneIndexChanged(this.currentSceneIdx,this.scenes)
    }
    addSceneBefore(){
        let index: number = this.scenes.findIndex(scene => scene === this.edit.scene)
        if(index === -1) throw Error("Couldn't find the current scene.")
        console.log("index",index)
        this.insertSceneAt(index)
        this.setScene(this.currentSceneIdx)
        this.onScenesChanged()
    }
    addSceneAfter(){
        let index: number = this.scenes.findIndex(scene => scene === this.edit.scene)
        if(index === -1) throw Error("Couldn't find the current scene.")
        this.insertSceneAt(index+1)
        this.setScene(this.currentSceneIdx+1)
        this.onScenesChanged()
    }
    protected insertSceneAt(index: number){
        this.scenes.splice(index,0,new Scene())
        this.undo.push({
            do: () => {
                this.scenes.splice(index,1)
                createMenu(this)
            },
            undo: () => {
                this.scenes.splice(index,0,new Scene())
                createMenu(this)
            }
        })
        createMenu(this)
        return index
    }
    removeScene(){
        let index: number = this.scenes.findIndex(scene => scene === this.edit.scene)
        if(index === -1) throw Error("Couldn't find the current scene.")
        const scene = this.scenes[index]
        if(scene === undefined) throw Error("Couldn't access the current scene.")
        this.scenes.splice(index,1)
        this.setScene(Math.min(this.currentSceneIdx,this.scenes.length-1))
        this.onScenesChanged()
        this.undo.push({
            do: () => {
                this.scenes.splice(index,1)
                createMenu(this)
            },  
            undo: () => {
                this.scenes.splice(index,0,scene)
                createMenu(this)
            }
        })

    }
    onScenesChanged(){
        this.scenePage.reload()
        this.edit.rightPanel.idWindow.reloadScenesOption(this.scenes)
    }
    setDefaultCpm(cpm: number){
        this.defaultCpm = cpm
        this.edit.bottomPanel.timeLine.slowBar.defaultCPM = cpm
    }
    resetId(targetSceneIndex: number){
        const doFunc = (): [number,number][][]|undefined => {
            type PosStr = `${number},${number}`
            // lastPosIdColorMapで階層間を対応付ける再帰関数
            // targetSceneまではMapの値は全てundefined
            // targetSceneを通過すると、Mapの値は各シーンの最終位置にいる人の[id,color]
            // [id,color]の値はtargetSceneの時のその人の値
            const rec = (
                targetSceneIndex: number, // 不変
                lastPosIdColorMap: Map<PosStr,[number,number]|undefined> = new Map(), // (前のシーンの最終位置):[id,color]のMap([id,color])
                sceneIndex = 0 // 階層が深くなるごとに増えていく
            ): Map<PosStr,[number,number]|undefined> => {
                const scene = this.scenes[sceneIndex]
                if(scene === undefined){
                    return lastPosIdColorMap
                }
                let stopFlag = false

                let nextLstPosIdColorMap = new Map<PosStr,[number,number]|undefined>() // (現在のシーンの最終位置):[id,color]のMap
                let lastPosPersonMap = new Map<PosStr,Person>() // (前のシーンの最終位置):(現在シーンのPerson)のMap
                const isTargetScene = sceneIndex === targetSceneIndex
                // 前のシーンの最終位置と現在シーンの初期位置で対応付ける
                scene.persons.forEach(person => {
                    const startPosStr: PosStr = `${person.startState.pos.x},${person.startState.pos.y}` // 現在シーンの初期位置文字列
                    if(sceneIndex !== 0){
                        // 前のシーンから位置的に対応付けられる人がいなければ打ち切る
                        if(!lastPosIdColorMap.has(startPosStr)) stopFlag = true
                        if(stopFlag) return
                    }
                    
                    const preIdColorPair = lastPosIdColorMap.get(startPosStr) // これより前のシーンから引き継がれてきた[id,color]
                    const lastState = simLastState(person,scene) // 現在シーンの最終位置
                    const lastPosStr: PosStr = `${lastState.pos.x},${lastState.pos.y}` // 現在シーンの最終位置文字列
                    nextLstPosIdColorMap.set(
                        lastPosStr,
                        isTargetScene 
                        ? [person.id,person.colorIndex] // 現在シーンが基準のシーンなら
                        : preIdColorPair
                    )
                    lastPosPersonMap.set( lastPosStr, person )
                })
                if(stopFlag){
                    return lastPosIdColorMap
                }
                // 次のシーンに行く
                const posIdColorMap = rec(targetSceneIndex,nextLstPosIdColorMap,sceneIndex+1)
                
                // おそらくtargetSceneを通過して戻ってきてるはずだから(わからないので下のif＊で確認してる)、
                // それで得られたidとcolorをlastPosをもとに設定する
                let existsUnd = false // 
                posIdColorMap.forEach((pair,posStr) => {
                    const person = lastPosPersonMap.get(posStr)
                    if(person === undefined) { existsUnd = true; return } // 最終位置から人が特定できないときのif文だが、まずありえない
                    if(pair === undefined) { existsUnd = true; return } // このif文はtargetSceneに到達できなかったとき(if＊)
                    if(existsUnd) return
                    // targetSceneのシーンのid,colorを設定する
                    person.id = pair[0]
                    person.colorIndex = pair[1]

                    const startPosStr: PosStr = `${person.startState.pos.x},${person.startState.pos.y}`
                    if(sceneIndex !== 0){
                        // 前のシーンの最終位置の集合に現在シーンの初期位置が含まれないときのif文
                        // これがtrueならそもそも上で打ち切りになっているのでありえない
                        if(!lastPosIdColorMap.has(startPosStr)) { existsUnd = true; return }
                    }
                    // targetSceneのとこで設定されたpair([id,color]のこと)を上の階層に伝えるために設定
                    lastPosIdColorMap.set( startPosStr, pair )
                })
                // 上の階層へ伝える
                return lastPosIdColorMap
            }
            // 番号振り直しをする前の各Personの[id,color]の組を記録しておく(undoのため)
            const befIdColorss = this.scenes.map<[number,number][]>(scene => 
                scene.persons.map<[number,number]>(person => 
                    [person.id,person.colorIndex]
                )
            )
            const ret = rec(targetSceneIndex)
            if(!Array.from(ret).every(v => v !== undefined)){
                return undefined
            }
            return befIdColorss
        }
        const befIdss = doFunc()
        if(befIdss === undefined){
            message("最初のシーンから基準のシーンまでの間に最終位置と初期位置が一致しないシーンが存在する可能性があります。\n基準のシーン番号を小さくして試してみてください。")
            return
        }
        this.edit.drawFirstFrame()
        this.undo.push({
            do: () => {
                doFunc()
                this.edit.drawFirstFrame()
            },
            undo: () => {
                this.scenes.forEach((scene,i) => {
                    scene.persons.forEach((person,j) => {
                        person.id = befIdss[i][j][0]
                        person.colorIndex = befIdss[i][j][1]
                    })
                })
                this.edit.drawFirstFrame()
            }
        })
    }
    async play(sceneNum?: number){
        if(this.playing){
            await message("すでに再生中です。")
            return
        }
        this.playing = true
        if(typeof sceneNum === "number"){
            if(sceneNum < 0 || sceneNum >= this.scenes.length){
                // 普通にアプリを操作していたらあり得ないはず
                await message("現在のシーンが見つかりませんでした。")
                return 
            }
            if(!PlayConditions.macroOk(this.scenes[sceneNum])){
                await message("マクロが設定されてない人がいます。\nマクロが設定されていない人は表示されません。")
            }
            if(!PlayConditions.countOk(this.scenes[sceneNum])){
                await message("カウント数が一致しません。\n最大カウント数の人のみ表示されます。")
            }

            // 衝突について
            // 最初の衝突のシーン、フレーム、人を探す
            let firstOverlap:{
                frameNum: number
                overlappingPersonIds: number[][]
            } = {frameNum:-1,overlappingPersonIds:[]}
            let firstOverlappingSceneIndex = -1
            const overlappingFrames = PlayConditions.overlappingFrames(this.scenes[sceneNum])
            if(overlappingFrames === undefined) return
            if(overlappingFrames.length > 0 && firstOverlappingSceneIndex === -1){
                firstOverlap = overlappingFrames[0]
                firstOverlappingSceneIndex = sceneNum
            }
            if(firstOverlappingSceneIndex !== -1){
                await message(`シーン${firstOverlappingSceneIndex+1}のフレーム${firstOverlap.frameNum}で${
                    firstOverlap.overlappingPersonIds.map(personIds => personIds.join("と")).join("、")
                }
                の衝突が発生しています。`)
            }
        }else{
            if(!this.scenes.every(scene => PlayConditions.macroOk(scene))){
                await message("マクロが設定されてない人がいます。\nマクロが設定されていない人は表示されません。")
            }
            if(!this.scenes.every(scene => PlayConditions.countOk(scene))){
                await message("カウント数が一致しません。\n最大カウント数の人のみ表示されます。")
            }

            // 衝突について
            // 最初の衝突のシーン、フレーム、人を探す
            let firstOverlap:{
                frameNum: number
                overlappingPersonIds: number[][]
            } = {frameNum:-1,overlappingPersonIds:[]}
            let firstOverlappingSceneIndex = -1
            this.scenes.forEach((scene,sceneIndex) => {
                const overlappingFrames = PlayConditions.overlappingFrames(scene)
                if(overlappingFrames === undefined) return
                if(overlappingFrames.length > 0 && firstOverlappingSceneIndex === -1){
                    firstOverlap = overlappingFrames[0]
                    firstOverlappingSceneIndex = sceneIndex
                }
            })
            if(firstOverlappingSceneIndex !== -1){
                await message(`シーン${firstOverlappingSceneIndex+1}のフレーム${firstOverlap.frameNum}で${
                    firstOverlap.overlappingPersonIds.map(personIds => personIds.join("と")).join("、")
                }
                の衝突が発生しています。`)
            }
        }

        const sceneFrames = createFrames(this.scenes,1,sceneNum,sceneNum)
        if(sceneFrames === null){
            this.playing = false
            return
        }
        const slowSegmentss = sceneNum === undefined?
            this.scenes.map(scene => scene.slowSegments) :
            [this.scenes[sceneNum].slowSegments]

        this.edit.rightPanel.hide()
        this.edit.leftPanel.hide()
        this.edit.bottomPanel.hide()
        this.edit.editField.uiCanvas.cancel()
        this.edit.editField.uiCanvas.clearAll()
        
        this.player.onCountChanged = (countState) => {
            this.edit.topPanel.sceneStateDisp.setSceneIndex(countState.sceneIndex)
            this.edit.topPanel.sceneStateDisp.setCountNum(countState.count)
        }
        this.musicPlayer.play()
        await this.player.play(1,this.defaultCpm,sceneFrames,sceneNum||0,slowSegmentss,this.segPlus1)
        this.musicPlayer.pause()
        this.playing = false
        await message("アニメーション終了")
        this.edit.drawFirstFrame()
        this.edit.topPanel.sceneStateDisp.setSceneIndex(this.currentSceneIdx)
        this.edit.topPanel.sceneStateDisp.setCountNum(0)
        this.edit.rightPanel.display()
        this.edit.leftPanel.display()
        this.edit.bottomPanel.display()
    }
    async manualPlay(scene?: number){
        if(this.playing){
            await message("すでに再生中です。")
            return
        }
        this.playing = true
        if(!this.scenes.every(scene => PlayConditions.macroOk(scene))){
            await message("マクロが設定されてない人がいます。\nマクロが設定されていない人は表示されません。")
        }
        if(!this.scenes.every(scene => PlayConditions.countOk(scene))){
            await message("カウント数が一致しません。\n最大カウント数の人のみ表示されます。")
        }
        const overlappingFrames = this.scenes.map(scene => PlayConditions.overlappingFrames(scene)).filter(v => v?v.length > 0 : false)
        if(overlappingFrames.length > 0){
            await message("人同士の衝突が発生しています。")
        }
        const sceneFrames = createFrames(this.scenes,1)
        if(sceneFrames === null) return
        
        this.edit.rightPanel.hide()
        this.edit.leftPanel.hide()
        this.edit.bottomPanel.hide()
        this.edit.editField.uiCanvas.cancel()
        this.edit.editField.uiCanvas.clearAll()
        
        this.manualPlayer.onCountChanged = (countState) => {
            this.edit.topPanel.sceneStateDisp.setSceneIndex(countState.sceneIndex)
            this.edit.topPanel.sceneStateDisp.setCountNum(countState.count)
        }
        await this.manualPlayer.play(1,sceneFrames,scene)
        window.onkeydown = _=>{}
        this.playing = false
        await message("アニメーション終了")
        this.edit.drawFirstFrame()
        this.edit.topPanel.sceneStateDisp.setSceneIndex(this.currentSceneIdx)
        this.edit.topPanel.sceneStateDisp.setCountNum(0)
        this.edit.rightPanel.display()
        this.edit.leftPanel.display()
        this.edit.bottomPanel.display()
    }
}