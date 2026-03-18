import { Narve } from "narve";
import EditField from "./Edit/EditField";
import "./styles/edit.css"
import LeftPanel from "./Edit/leftPanel";
import Person from "../global/Person";
import Point from "../global/Point";
import Scene from "../global/Scene";
import { createFirstFrame } from "../global/CreateFrames";
import RightPanel from "./Edit/rightPanel";
import PointDiff from "../global/PointDiff";
import PersonState from "../global/PersonState";
import { massCanvasDef, massCanvasDef as ms } from "../global/massCanvasDef";
import { UndoFunc } from "../global/Undo";
import Slide, { Link } from "../global/Slide";
import { message } from "@tauri-apps/plugin-dialog";
import simLastState from "../global/simLastState";
import { solveSimulEq } from "../global/simulEqSolver";
import TopPanel from "./Edit/topPanel";
import BottomPanel from "./Edit/bottomPanel";

export default class Edit extends Narve.Component {
    scene: Scene
    sceneIndex: number

    editField = new EditField()
    topPanel = new TopPanel()
    leftPanel = new LeftPanel()
    rightPanel = new RightPanel(this)
    bottomPanel = new BottomPanel()

    constructor(_scene: Scene,sceneNum: number){
        super("div",{class: "edit"})
        this.children.set(this.topPanel,this.leftPanel,this.editField,this.rightPanel,this.bottomPanel)

        this.scene = _scene
        this.sceneIndex = sceneNum
        this.setScene(_scene, sceneNum)

        this.editField.uiCanvas.onHoveringPointChanged = pos => {
            this.leftPanel.setHoveringPoint(pos)
        }

        this.rightPanel.cancelAll = () => {
            this.editField.uiCanvas.cancel()
            this.leftPanel.clear()
            this.editField.uiCanvas.clearAll()
        }
        this.rightPanel.macroEditWindow.drawMacro = () => this.editField.uiCanvas.drawPersonsMacroMarkers(this.scene.persons)
        this.rightPanel.macroEditWindow.startInputMacro = d => this.bottomPanel.startInputMacro(d)

        // 配置ボタンたち
        this.rightPanel.deployBtns.pointBtn.elem.onclick    = async ()=>{while(await this.startPointDeploy());}
        this.rightPanel.deployBtns.lineBtn.elem.onclick     = ()=>this.startLineDeploy()
        this.rightPanel.deployBtns.rectBtn.elem.onclick     = ()=>this.startRectDeploy()
        this.rightPanel.deployBtns.circleBtn.elem.onclick   = ()=>this.startCircleDeploy()
        this.rightPanel.deployBtns.distanceBtn.elem.onclick = ()=>this.startDistanceDeploy()
        this.rightPanel.deployBtns.removeBtn.elem.onclick   = async ()=>{while(await this.startRemovePerson());}
        this.rightPanel.deployBtns.recycleBtn.elem.onclick  = ()=>this.recycle()
        this.rightPanel.deployBtns.alignBtn.elem.onclick    = async ()=>{while(await this.align());}
        this.rightPanel.deployBtns.copyAndPaste.elem.onclick= async ()=>{while(await this.startCopyAndPaste());}
        this.rightPanel.deployBtns.cutAndPaste.elem.onclick = async ()=>{while(await this.startCopyAndPaste(true));}

        this.rightPanel.deployBtns.symmetryWindow.onSymmetryLineClicked = (theta,mode) => this.startSymmetry(theta,mode)
        this.rightPanel.deployBtns.symmetryWindow.oBtn.elem.onclick = () => this.startSymmetryO()
        this.rightPanel.deployBtns.symmetryWindow.L90Btn.elem.onclick = () => this.startRevolveCopy(90,"L90度回転")
        this.rightPanel.deployBtns.symmetryWindow.R90Btn.elem.onclick = () => this.startRevolveCopy(-90,"R90度回転")


        this.rightPanel.rootMenu.rotateAngleBtn.elem.onclick = async ()=>{while(await this.startSetRotateAngle());}
        this.rightPanel.rootMenu.specialRotateAngleBtn.elem.onclick = async ()=>{while(await this.startSetSpecialRotateAngle());}
        
        this.rightPanel.macroEditWindow.applyMacroBtn.elem.onclick = async ()=>{while(await this.startApplyMacro(false));}
        this.rightPanel.macroEditWindow.applyReverseMacroBtn.elem.onclick = async ()=>{while(await this.startApplyMacro(true));}
 
        this.rightPanel.slideEditWindow.drawSlide = slide => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
        }

        // 目的地配置ボタンたち
        this.rightPanel.slideEditWindow.deployDestination.pointBtn.elem.onclick = async ()=>{while(await this.startPointDeployDest());}
        this.rightPanel.slideEditWindow.deployDestination.lineBtn.elem.onclick = ()=>this.startLineDeployDest()
        this.rightPanel.slideEditWindow.deployDestination.rectBtn.elem.onclick = ()=>this.startRectDeployDest()
        this.rightPanel.slideEditWindow.deployDestination.circleBtn.elem.onclick = ()=>this.startCircleDeployDest()
        this.rightPanel.slideEditWindow.deployDestination.distanceBtn.elem.onclick = ()=>this.startDistanceDeployDest()
        this.rightPanel.slideEditWindow.deployDestination.removeBtn.elem.onclick = async ()=>{while(await this.startRemoveDest());}
        this.rightPanel.slideEditWindow.deployDestination.alignBtn.elem.onclick = async ()=>{while(await this.alignDest());}
        this.rightPanel.slideEditWindow.deployDestination.copyAndPaste.elem.onclick= async ()=>{while(await this.startCopyAndPasteDest());}
        this.rightPanel.slideEditWindow.deployDestination.cutAndPaste.elem.onclick= async ()=>{while(await this.startCopyAndPasteDest(true));}

        this.rightPanel.slideEditWindow.deployDestination.symmetryWindow.onSymmetryLineClicked = (theta,mode) => this.startSymmetryDest(theta,"目的地編集-"+mode)
        this.rightPanel.slideEditWindow.deployDestination.symmetryWindow.oBtn.elem.onclick = () => this.startSymmetryODest()
        this.rightPanel.slideEditWindow.deployDestination.symmetryWindow.L90Btn.elem.onclick = () => this.startRevolveCopyDest(90,"目的地編集-L90度回転")
        this.rightPanel.slideEditWindow.deployDestination.symmetryWindow.R90Btn.elem.onclick = () => this.startRevolveCopyDest(-90,"目的地編集-R90度回転")

        // スライド
        this.rightPanel.slideEditWindow.rootMenu.linkBtn.elem.onclick = async ()=>{while(await this.startLink());}

        // 色
        this.rightPanel.setColorIndexWindow.applyBtn.elem.onclick = async ()=>{while(await this.startApplyColor());}

        // 番号
        this.rightPanel.idWindow.onResetIdBtnClicked = (targetSceneIndex)=>this.resetId(targetSceneIndex)
        this.rightPanel.idWindow.checkIdBtn.elem.onclick = async ()=>{while(await this.startCheckId());}

        // 変数
        this.rightPanel.varsSettings.onApplyBtnClicked = async ()=>{while(await this.startApplyVars());}
        this.rightPanel.varsSettings.onVarNameSelectChanged = varName => this.editField.uiCanvas.drawPersonsVarMarkers(this.scene.persons,varName)
        this.rightPanel.varsSettings.varDispBtn.elem.onclick = async ()=>{while(await this.startCheckVars());}
        
    }
    setScene(scene: Scene, sceneIndex: number){
        console.log("sceneIndex in edit", sceneIndex)
        this.scene = scene
        this.sceneIndex = sceneIndex
        this.rightPanel.setScene(scene)
        this.topPanel.setScene(sceneIndex)
        this.leftPanel.clear()
        this.bottomPanel.setScene(scene,sceneIndex)
        this.drawFirstFrame()
        this.editField.uiCanvas.clearAll()
        this.onSceneChanged(scene,sceneIndex)
    }
    onSceneChanged(scene: Scene, sceneNum: number){
        scene;
        this.topPanel.sceneStateDisp.setSceneIndex(sceneNum)
        this.topPanel.sceneStateDisp.setCountNum(0)
    }
    // deploy
    // MEMO inputとかselectとかに前回の入力情報残るかも。ごめん
    // MEMO inputとか使わないときも表示されてるかも。すまん
    async startPointDeploy(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("点配置")
        this.leftPanel.order("マス上でクリックしてください(正確な点選択)")

        const point = await this.editField.uiCanvas.getAccuratePoint()
        if(point === null) return false
        const person = this.addNewPerson(point)
        this.drawFirstFrame()
        this.pushUndoAddNewPersons(person)
        return true
    }
    async startLineDeploy(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("直線配置")

        this.leftPanel.order("始点と終点をクリックしてください(正確な点選択)")
        const points = await this.editField.uiCanvas.getAccurateLine()
        if(points === null) return

        const [point1,point2] = points
        this.editField.uiCanvas.drawLine(point1,point2)

        const peopleNum = await this.leftPanel.askNumber("人数を入力してください",n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawLine(point1,point2)
            const diff = point2.sub(point1).toDiff()
            const dDiff = n>=2 ? diff.mul(1/(n-1)) : new PointDiff(0,0)
            Array(n).fill(0).map((_,i) => {
                this.editField.uiCanvas.drawPersonGoast(new PersonState(
                    point1.add(dDiff.mul(i)),
                    ms.defRotateAngle
                ))
            })
        })
        if(peopleNum === null || peopleNum <= 0) return

        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const diff = point2.sub(point1).toDiff()
        const dDiff = peopleNum>=2 ? diff.mul(1/(peopleNum-1)) : new PointDiff(0,0)
        const persons = Array(peopleNum).fill(0).map((_,i) => 
            this.addNewPerson(point1.add(dDiff.mul(i)))
        )
        this.editField.uiCanvas.clearAll()
        this.drawFirstFrame()
        this.pushUndoAddNewPersons(...persons)
    }
    async startRectDeploy(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("矩形配置")

        this.leftPanel.order("始点と終点をクリックしてください(正確な点選択)")
        const points = await this.editField.uiCanvas.getAccurateRect()
        if(points === null) return

        const [point1,point2] = points
        this.editField.uiCanvas.drawRect(point1,point2)

        const colNum = await this.leftPanel.askNumber("横の人数を入力してください", n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawRect(point1,point2)
            const diff = point2.sub([point1.x,point2.y]).toDiff()// 横成分だけ
            const dDiff = n>=2 ? diff.mul(1/(n-1)) : new PointDiff(0,0)
            Array(n).fill(0).map((_,i) => {
                this.editField.uiCanvas.drawPersonGoast(new PersonState(
                    point1.add(dDiff.mul(i)),
                    ms.defRotateAngle
                ))
            })
        })
        if(colNum === null || colNum <= 0) return

        const rowNum = await this.leftPanel.askNumber("縦の人数を入力してください", n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawRect(point1,point2)
            const diff = point2.sub(point1).toDiff()
            const dx = colNum >= 2?diff.x/(colNum-1):0
            const dy = n >= 2?diff.y/(n-1):0
            Array(n).fill(0).forEach((_,r) => 
                Array(colNum).fill(0).forEach((_,c) => {
                    this.editField.uiCanvas.drawPersonGoast(new PersonState(
                        point1.add([dx*c,dy*r]),
                        ms.defRotateAngle
                    ))
                })
            )
        })
        if(rowNum === null || rowNum <= 0) return

        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const diff = point2.sub(point1).toDiff()
        const dx = colNum >= 2?diff.x/(colNum-1):0
        const dy = rowNum >= 2?diff.y/(rowNum-1):0
        const persons = Array(rowNum).fill(0).map((_,r) => 
            Array(colNum).fill(0).map((_,c) => 
                this.addNewPerson(point1.add([dx*c,dy*r]))
            )
        ).reduce((acc,cur) => [...acc,...cur],[])
        this.editField.uiCanvas.clearAll()
        this.drawFirstFrame()
        this.pushUndoAddNewPersons(...persons)
    }
    async startCircleDeploy(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("円形配置")

        this.leftPanel.order("中心と円周上の一点をクリックしてください(正確な点選択)")
        const points = await this.editField.uiCanvas.getAccurateCircle()
        if(points === null) return

        const [center,otherP] = points
        this.editField.uiCanvas.drawCircle(center,otherP)

        const startAngle = await this.leftPanel.askAngle("初期角度を選択してください")
        if(startAngle === null) return

        const peopleNum = await this.leftPanel.askNumber("人数を入力してください", n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawCircle(center,otherP)
            const r = center.distance(otherP)
            const dTheta = 360/n
            const startPoint = center.add([r,0]).toRevolved(startAngle,center)
            Array(n).fill(0).forEach((_,i) => 
                this.editField.uiCanvas.drawPersonGoast(new PersonState(
                    startPoint.toRevolved(dTheta*i,center),
                    ms.defRotateAngle
                ))
            )
        })
        if(peopleNum === null || peopleNum <= 0) return


        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const r = center.distance(otherP)
        const dTheta = 360/peopleNum
        const startPoint = center.add([r,0]).toRevolved(startAngle,center)
        const persons = Array(peopleNum).fill(0).map((_,i) => 
            this.addNewPerson(startPoint.toRevolved(dTheta*i,center))
        )
        this.editField.uiCanvas.clearAll()
        this.drawFirstFrame()
        this.pushUndoAddNewPersons(...persons)
    }
    async startDistanceDeploy(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("間隔指定配置")

        this.leftPanel.order("始点をクリックしてください(正確な点選択)")
        const startPoint = await this.editField.uiCanvas.getAccuratePoint()
        if(startPoint === null) return
        
        const colDistance = await this.leftPanel.askDistance("横の間隔を選択してください")
        if(colDistance === null || colDistance <= 0) return

        const colNum = await this.leftPanel.askNumber("横の人数を入力してください",n => {
            this.editField.uiCanvas.clearAll()
            Array(n).fill(0).forEach((_,i) => {
                this.editField.uiCanvas.drawPersonGoast(new PersonState(
                    startPoint.add([colDistance*i,0]),
                    ms.defRotateAngle
                ))
            })
        })
        if(colNum === null || colNum <= 0) return

        const rowDistance = await this.leftPanel.askDistance("縦の間隔を入力してください")
        if(rowDistance === null || rowDistance <= 0) return

        const rowNum = await this.leftPanel.askNumber("縦の人数を入力してください",n => {
            this.editField.uiCanvas.clearAll()
            Array(n).fill(0).forEach((_,r) => {
                Array(colNum).fill(0).forEach((_,c) => {
                    this.editField.uiCanvas.drawPersonGoast(new PersonState(
                        startPoint.add([colDistance*c,rowDistance*r]),
                        ms.defRotateAngle
                    ))
                })
            })
        })
        if(rowNum === null || rowNum <= 0) return

        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const persons = Array(rowNum).fill(0).map((_,r) => 
            Array(colNum).fill(0).map((_,c) => 
                this.addNewPerson(startPoint.add([colDistance*c,rowDistance*r]))
            )
        ).reduce((acc,cur) => [...acc,...cur],[])
        this.editField.uiCanvas.clearAll()
        this.drawFirstFrame()
        this.pushUndoAddNewPersons(...persons)
    }
    async startRemovePerson(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("削除")
        const persons = await this.startSelectRangePersons("削除したい範囲を指定してください")
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        if(persons === undefined) return false
        this.removePersons(...persons)
        this.drawFirstFrame()
        this.pushUndo({
            do: () => {
                this.removePersons(...persons)
                this.drawFirstFrame()
            },
            undo: ()  => {
                this.addPersons(...persons)
                this.drawFirstFrame()
            }
        })
        return true
    }
    recycle(){
        const prevScene = this.getPrevScene()
        if(prevScene === undefined){
            message("ひとつ前のシーンが見つかりませんでした。")
            return
        }
        const befPersons = this.scene.persons.map(person => {
            return person.clone(person.id)
        })
        const persons = prevScene.persons.map((prePerson) => {
            const lastState = simLastState(prePerson,prevScene)
            const person = new Person(lastState.pos,prePerson.id)
            person.startState.rotateAngle = lastState.rotateAngle
            person.colorIndex = prePerson.colorIndex
            person.inDisplay = prePerson.inDisplay
            return person
        })
        this.scene.persons = persons
        this.onPersonsChanged(this.scene.persons.length)
        this.drawFirstFrame()
        this.pushUndo({
            do: () => {
                this.scene.persons = persons
                this.onPersonsChanged(this.scene.persons.length)
                this.drawFirstFrame()
            },
            undo: () => {
                this.scene.persons = befPersons
                this.onPersonsChanged(this.scene.persons.length)
                this.drawFirstFrame()
            }
        })
    }
    async align(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("整列")
        const base = await this.leftPanel.askAlign("整列単位を選択してください")
        if(base === null) return false
        const persons = await this.startSelectRangePersons("適用範囲を選択してください")
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        if(persons === undefined) return false
        const befPos: [Person,Point][] = this.scene.persons.map(person => [person,person.startState.pos.clone()])
        persons.forEach(person => {
            person.startState.pos = person.startState.pos.nearestGrid(base)
        })
        this.drawFirstFrame()
        this.pushUndo({
            do: () => {
                persons.forEach(person => {
                    person.startState.pos = person.startState.pos.nearestGrid(base)
                })
                this.drawFirstFrame()
            },
            undo: () => {
                befPos.forEach(([person,pos]) => person.startState.pos = pos)
                this.drawFirstFrame()
            }
        })
        return true
    }
    // theta: 度
    async startSymmetry(theta: number,mode: string){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr(mode)
        const persons = await this.startSelectRangePersons("対称にコピーする人を選択してください")
        if(persons === undefined) return
        const newPoses = persons.map(person => person.startState.pos.toSymmetry(theta,ms.centerPx))
        this.pushUndoAddNewPersons(...this.addNewPersons(...newPoses))
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        this.drawFirstFrame()
    }
    async startSymmetryO(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("原点対称")
        const persons = await this.startSelectRangePersons("対称にコピーする人を選択してください")
        if(persons === undefined) return
        const newPoses = persons.map(person => person.startState.pos.toSymmetry(90,ms.centerPx).toSymmetry(0,ms.centerPx))
        this.pushUndoAddNewPersons(...this.addNewPersons(...newPoses))
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        this.drawFirstFrame()
    }
    // theta: 度
    async startRevolveCopy(theta: number,mode: string){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr(mode)
        const persons = await this.startSelectRangePersons("対称にコピーする人を選択してください")
        if(persons === undefined) return
        const newPoses = persons.map(person => person.startState.pos.toRevolved(theta,ms.centerPx))
        this.pushUndoAddNewPersons(...this.addNewPersons(...newPoses))
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        this.drawFirstFrame()
    }
    // MEMO 向き・マクロ・色はコピーしない。位置だけ
    async startCopyAndPaste(cutAndPaste = false){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr(cutAndPaste?"切り取り":"コピー")
        const persons = await this.startSelectRangePersons("人を選択してください")
        this.editField.uiCanvas.clearAll()
        if(persons === undefined) return
        persons.forEach(person => this.editField.uiCanvas.drawSelect(person.state.pos))
        const basePerson = persons.reduce((base,person) => {
            if(base.startState.pos.x < person.startState.pos.x) return base
            if(base.startState.pos.x > person.startState.pos.x) return person
            if(base.startState.pos.y <= person.startState.pos.y) return base
            return person
        })
        this.leftPanel.clear()
        this.leftPanel.order("選択範囲の最も左にいる人の中で最も上にいる人を配置する場所をクリックしてください(正確な点選択)")
        const pastePoint = await this.editField.uiCanvas.getAccuratePoint(point => {
            this.editField.uiCanvas.clearAll()
            persons.forEach(person => {
                const state = person.startState.clone()
                state.pos = state.pos.sub(basePerson.startState.pos).add(point)
                state.rotateAngle = ms.defRotateAngle
                this.editField.uiCanvas.drawPersonGoast(state)
            })
        })
        if(pastePoint === null) return false
        const newPersons = this.addNewPersons(...persons.map(person => 
            person.startState.pos.sub(basePerson.startState.pos).add(pastePoint)
        ))
        if(cutAndPaste){
            this.removePersons(...persons)
        }
        this.pushUndo({
            do: () => {
                this.addPersons(...newPersons)
                if(cutAndPaste) this.removePersons(...persons)
                this.drawFirstFrame()
            },
            undo: () => {
                this.removePersons(...newPersons)
                if(cutAndPaste) this.addPersons(...persons)
                this.drawFirstFrame()
            }
        })
        this.editField.uiCanvas.clearAll()
        this.drawFirstFrame()
        return true
    }
    async startSetRotateAngle(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()

        const persons = await this.startSelectRangePersons("初期方向を適用する範囲を指定してください",true)
        if(persons === undefined) return false
        const person_anglePair: [Person,number][] = persons.map(person => [person,person.startState.rotateAngle])
        const angle = this.leftPanel.rotateAngleSelect.value
        persons.forEach(person => {
            person.startState.rotateAngle = angle
        })
        this.drawFirstFrame()
        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()
        this.pushUndo({
            do: () => {
                person_anglePair.forEach(([person,_]) => {
                    person.startState.rotateAngle = angle
                })
                this.drawFirstFrame()
            },
            undo: () => {
                person_anglePair.forEach(([person,angle]) => {
                    person.startState.rotateAngle = angle
                })
                this.drawFirstFrame()
            }
        })
        return true
    }
    async startSetSpecialRotateAngle(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("特殊初期方向設定")
        this.leftPanel.order("向く方向の点をクリックしてください(正確な点選択)")

        const point = await this.editField.uiCanvas.getAccuratePoint()
        if(point === null) return false

        const persons = await this.startSelectRangePersons("特殊初期方向を適用する範囲を指定してください")
        if(persons === undefined) return false
        // undo用に変更前の方向を保存しておく
        const person_anglePair: [Person,number][] = persons.map(person => [person,person.startState.rotateAngle])
        persons.forEach(person => {
            person.startState.rotateAngle = person.startState.pos.angle(point)
        })
        this.drawFirstFrame()
        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()
        this.pushUndo({
            do: () => {
                person_anglePair.forEach(([person,_]) => {
                    person.startState.rotateAngle = person.startState.pos.angle(point)
                })
                this.drawFirstFrame()
            },
            undo: () => {
                person_anglePair.forEach(([person,angle]) => {
                    person.startState.rotateAngle = angle
                })
                this.drawFirstFrame()
            }
        })
        return true
    }
    async startApplyMacro(reverseFlag: boolean){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("マクロ適用")
        const persons = await this.startSelectRangePersons(`${reverseFlag?"ダッシュ":""}マクロを適用する範囲を指定してください`)
        this.editField.uiCanvas.clearAll()
        if(persons === undefined) return
        this.leftPanel.clear()
        const newMacroIndex = this.rightPanel.macroEditWindow.getFocusingMacroIndex()
        const person_macroIndex_reverseFlagPair: [Person,number|undefined,boolean][] = persons.map(person => [person,person.macroIndex,person.reverseFlag])
        persons.forEach(person => {
            person.macroIndex = newMacroIndex
            person.reverseFlag = reverseFlag
        })
        this.onMacroApplied()
        this.pushUndo({
            do: () => {
                persons.forEach(person => {
                    person.macroIndex = newMacroIndex
                    person.reverseFlag = reverseFlag
                })
                this.onMacroApplied()
            },
            undo: () => {
                person_macroIndex_reverseFlagPair.forEach(([person,macroIndex]) => {
                    person.macroIndex = macroIndex
                    person.reverseFlag = reverseFlag
                })
                this.onMacroApplied()
            }
        })
        return true
    }
    onMacroApplied(){
        this.editField.uiCanvas.drawPersonsMacroMarkers(this.scene.persons)
        this.bottomPanel.setScene(this.scene,this.sceneIndex)
    }
    async startApplyVars(){
        const varName = this.rightPanel.varsSettings.getVarName()
        const value = this.rightPanel.varsSettings.getValue()
        const inc = this.rightPanel.varsSettings.getInc()
        if(varName === null || value === null || inc === null) return false
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("変数適用")
        const persons = await this.startSelectRangePersons("変数を適用する範囲を指定してください")
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        if(persons === undefined) return
        const person_varsPair: [Person,ms.Variables][] = persons.map(person => [person,person.variables])
        persons.forEach((person,i) => {
            person.variables[varName] = value + inc*i
        })
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        this.editField.uiCanvas.drawPersonsVarMarkers(this.scene.persons,varName)
        this.pushUndo({
            do: () => {
                persons.forEach((person,i) => {
                    person.variables[varName] = value + inc*i
                })
                this.editField.uiCanvas.drawPersonsVarMarkers(this.scene.persons,varName)
            },
            undo: () => {
                person_varsPair.forEach(([person,vars]) => {
                    person.variables = vars
                })
                this.editField.uiCanvas.drawPersonsVarMarkers(this.scene.persons,varName)
            }
        })
        return true
    }
    async startCheckVars(){
        const point = await this.editField.uiCanvas.getPoint()
        if(point === null) return false
        const [person,_] = this.nearestPerson(point)
        if(person === undefined) return false
        this.rightPanel.varsSettings.dispPersonVars(person)
        return true
    }
    // deploy destination
    async startPointDeployDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return
        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("目的地編集-点")
        this.leftPanel.order("マス上でクリックしてください(正確な点選択)")

        const point = await this.editField.uiCanvas.getAccuratePoint(() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        if(point === null) return false
        const newLink = new Link(point)
        slide.links.push(newLink)
        this.rightPanel.slideEditWindow.reloadSelect()
        this.pushUndoAddNewDests(slide,newLink)
        return true
    }
    async startLineDeployDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return
        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("目的地編集-直線")
        this.leftPanel.order("始点と終点をクリックしてください(正確な点選択)")

        const points = await this.editField.uiCanvas.getAccurateLine(() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        if(points === null) return

        const [point1,point2] = points
        this.editField.uiCanvas.drawSlide(slide)
        this.editField.uiCanvas.drawLine(point1,point2)

        const destNum = await this.leftPanel.askNumber("数を入力してください",n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
            this.editField.uiCanvas.drawLine(point1,point2)
            const diff = point2.sub(point1).toDiff()
            const dDiff = n>=2 ? diff.mul(1/(n-1)) : new PointDiff(0,0)
            Array(n).fill(0).map((_,i) => {
                this.editField.uiCanvas.drawDestGoast(point1.add(dDiff.mul(i)))
            })
        })
        if(destNum === null || destNum <= 0) return
        const diff = point2.sub(point1).toDiff()
        const dDiff = destNum>=2 ? diff.mul(1/(destNum-1)) : new PointDiff(0,0)
        const links = Array(destNum).fill(0).map((_,i) => {            
            return new Link(point1.add(dDiff.mul(i)))
        })
        this.scene.slides[index].links.push(...links)
        this.rightPanel.slideEditWindow.reloadSelect()
        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.pushUndoAddNewDests(slide,...links)
    }
    async startRectDeployDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("目的地編集-矩形")
        this.leftPanel.order("始点と終点をクリックしてください(正確な点選択)")

        const points = await this.editField.uiCanvas.getAccurateRect(() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        if(points === null) return

        const [point1,point2] = points
        this.editField.uiCanvas.drawSlide(slide)
        this.editField.uiCanvas.drawRect(point1,point2)

        const colNum = await this.leftPanel.askNumber("横の人数を入力してください", n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
            this.editField.uiCanvas.drawRect(point1,point2)
            const diff = point2.sub([point1.x,point2.y]).toDiff()// 横成分だけ
            const dDiff = n>=2 ? diff.mul(1/(n-1)) : new PointDiff(0,0)
            Array(n).fill(0).map((_,i) => {
                this.editField.uiCanvas.drawDestGoast(point1.add(dDiff.mul(i)))
            })
        })
        if(colNum === null || colNum <= 0) return

        const rowNum = await this.leftPanel.askNumber("縦の人数を入力してください", n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
            this.editField.uiCanvas.drawRect(point1,point2)
            const diff = point2.sub(point1).toDiff()
            const dx = colNum >= 2?diff.x/(colNum-1):0
            const dy = n >= 2?diff.y/(n-1):0
            Array(n).fill(0).forEach((_,r) => 
                Array(colNum).fill(0).forEach((_,c) => {
                    this.editField.uiCanvas.drawDestGoast(point1.add([dx*c,dy*r]))
                })
            )
        })
        if(rowNum === null || rowNum <= 0) return

        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const diff = point2.sub(point1).toDiff()
        const dx = colNum >= 2?diff.x/(colNum-1):0
        const dy = rowNum >= 2?diff.y/(rowNum-1):0
        const links = Array(rowNum).fill(0).map((_,r) => 
            Array(colNum).fill(0).map((_,c) => 
                new Link(point1.add([dx*c,dy*r]))
            )
        ).reduce((acc,cur) => [...acc,...cur],[])
        slide.links.push(...links)
        this.editField.uiCanvas.drawSlide(slide)        
        this.pushUndoAddNewDests(slide,...links)
    }
    async startCircleDeployDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return
        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("目的地編集-円形")
        this.leftPanel.order("中心と円周上の一点をクリックしてください(正確な点選択)")


        const points = await this.editField.uiCanvas.getAccurateCircle(() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        if(points === null) return

        const [center,otherP] = points
        this.editField.uiCanvas.drawSlide(slide)
        this.editField.uiCanvas.drawCircle(center,otherP)
        
        const startAngle = await this.leftPanel.askAngle("初期角度を選択してください")
        if(startAngle === null) return

        const peopleNum = await this.leftPanel.askNumber("人数を入力してください",  n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
            this.editField.uiCanvas.drawCircle(center,otherP)
            const r = center.distance(otherP)
            const dTheta = 360/n
            const startPoint = center.add([r,0]).toRevolved(startAngle,center)
            Array(n).fill(0).forEach((_,i) => 
                this.editField.uiCanvas.drawDestGoast(startPoint.toRevolved(dTheta*i,center))
            )
        })
        if(peopleNum === null || peopleNum <= 0) return


        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const r = center.distance(otherP)
        const dTheta = 360/peopleNum
        const startPoint = center.add([r,0]).toRevolved(startAngle,center)
        const links = Array(peopleNum).fill(0).map((_,i) => 
            new Link(startPoint.toRevolved(dTheta*i,center))
        )
        slide.links.push(...links)
        this.editField.uiCanvas.drawSlide(slide)
        this.pushUndoAddNewDests(slide,...links)
    }
    async startDistanceDeployDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return
        
        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("目的地編集-間隔指定")
        this.leftPanel.order("始点をクリックしてください(正確な点選択)")        
        
        const startPoint = await this.editField.uiCanvas.getAccuratePoint(() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        if(startPoint === null) return
        
        const colDistance = await this.leftPanel.askDistance("横の間隔を選択してください")
        if(colDistance === null || colDistance <= 0) return

        const colNum = await this.leftPanel.askNumber("横の人数を入力してください",n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
            Array(n).fill(0).forEach((_,i) => {
                this.editField.uiCanvas.drawDestGoast(startPoint.add([colDistance*i,0]))
            })
        })
        if(colNum === null || colNum <= 0) return

        const rowDistance = await this.leftPanel.askDistance("縦の間隔を入力してください")
        if(rowDistance === null || rowDistance <= 0) return

        const rowNum = await this.leftPanel.askNumber("縦の人数を入力してください",n => {
            this.editField.uiCanvas.clearAll()
            this.editField.uiCanvas.drawSlide(slide)
            Array(n).fill(0).forEach((_,r) => {
                Array(colNum).fill(0).forEach((_,c) => {
                    this.editField.uiCanvas.drawDestGoast(startPoint.add([colDistance*c,rowDistance*r]))
                })
            })
        })
        if(rowNum === null || rowNum <= 0) return

        this.leftPanel.clear()
        this.editField.uiCanvas.clearAll()

        const links = Array(rowNum).fill(0).map((_,r) => 
            Array(colNum).fill(0).map((_,c) => 
                new Link(startPoint.add([colDistance*c,rowDistance*r]))
            )
        ).reduce((acc,cur) => [...acc,...cur],[])
        slide.links.push(...links)
        this.editField.uiCanvas.drawSlide(slide)
        this.pushUndoAddNewDests(slide,...links)
    }
    async startRemoveDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("目的地編集-削除")
        const f = () => {
            this.editField.uiCanvas.drawSlide(slide)
        }
        const links = await this.startSelectRangeDests("削除したい範囲を指定してください",f,f)
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        if(links.length === 0) return true
        this.removeLinks(slide,...links)
        this.editField.uiCanvas.drawSlide(slide)
        this.pushUndo({
            do: () => {
                this.removeLinks(slide,...links)
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            },
            undo: ()  => {
                slide.links.push(...links)
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            }
        })
        return true
    }
    async alignDest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("目的地編集-整列")
        const base = await this.leftPanel.askAlign("整列単位を選択してください")
        if(base === null) return false
        const f = () => {
            this.editField.uiCanvas.drawSlide(slide)
        }
        const links = await this.startSelectRangeDests("適用範囲を選択してください",f,f)
        const befPos: [Link,Point][] = slide.links.map(link => [link,link.absPos.clone()])
        links.forEach(link => {
            link.absPos = link.absPos.nearestGrid(base)
        })
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.pushUndo({
            do: () => {
                links.forEach(link => {
                    link.absPos = link.absPos.nearestGrid(base)
                })
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            },
            undo: () => {
                befPos.forEach(([link,pos]) => link.absPos = pos)
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            }
        })
        return true
    }
    async startSymmetryDest(theta: number,mode: string){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr(mode)
        const dests = await this.startSelectRangeDests("対称にコピーする目的地を選択してください",() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        const newPoses = dests.map(link => link.absPos.toSymmetry(theta,ms.centerPx))

        this.pushUndoAddNewDests(slide,...this.addNewDests(slide,...newPoses))
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
    }
    async startSymmetryODest(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr("目的地編集-原点対称")
        const links = await this.startSelectRangeDests("対称にコピーする目的地を選択してください",() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        const newPoses = links.map(link => link.absPos.toSymmetry(90,ms.centerPx).toSymmetry(0,ms.centerPx))
        this.pushUndoAddNewDests(slide,...this.addNewDests(slide,...newPoses))
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
    }
    // theta: 度
    async startRevolveCopyDest(theta: number,mode: string){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr(mode)
        const links = await this.startSelectRangeDests("対称にコピーする目的地を選択してください",() => {
            this.editField.uiCanvas.drawSlide(slide)
        })
        const newPoses = links.map(link => link.absPos.toRevolved(theta,ms.centerPx))
        this.pushUndoAddNewDests(slide,...this.addNewDests(slide,...newPoses))
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
    }
    async startCopyAndPasteDest(cutAndPaste = false){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        this.leftPanel.clear()
        this.leftPanel.setModeDispStr(cutAndPaste?"切り取り":"コピー")
        const f = () => {
            this.editField.uiCanvas.drawSlide(slide)
        }
        const links = await this.startSelectRangeDests("目的地を選択してください",f,f)
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        links.forEach(link => this.editField.uiCanvas.drawSelect(link.absPos))
        // 左上探し
        const baseLink = links.reduce((base,link) => {
            if(base.absPos.x < link.absPos.x) return base
            if(base.absPos.x > link.absPos.x) return link
            if(base.absPos.y <= link.absPos.y) return base
            return link
        })
        this.leftPanel.clear()
        this.leftPanel.order("選択範囲の最も左にある目的地の中で最も上にある目的地を配置する場所をクリックしてください(正確な点選択)")
        const pastePoint = await this.editField.uiCanvas.getAccuratePoint(point => {
            this.editField.uiCanvas.clearAll()
            links.forEach(link => {
                const pos = link.absPos.sub(baseLink.absPos).add(point)
                this.editField.uiCanvas.drawDestGoast(pos)
            })
        })
        if(pastePoint === null) return false
        const newLinks = this.addNewDests(slide,...links.map(link => 
            link.absPos.sub(baseLink.absPos).add(pastePoint)
        ))
        if(cutAndPaste){
            this.removeLinks(slide,...links)
        }
        this.pushUndo({
            do: () => {
                slide.links.push(...newLinks)
                if(cutAndPaste) this.removeLinks(slide,...links)
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            },
            undo: () => {
                this.removeLinks(slide,...newLinks)
                if(cutAndPaste) slide.links.push(...links)
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            }
        })
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)
        return true
    }
    async startLink(){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return false

        this.editField.uiCanvas.cancel()
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSlide(slide)// cancelでclearAllされることがある
        this.leftPanel.cancel()
        this.leftPanel.setModeDispStr("リンク")
        this.leftPanel.order("人か目的地をクリックしてください")

        const point1 = await this.editField.uiCanvas.getPoint()
        if(point1 === null) return false
        const [link1,destDist1] = this.nearestLink(point1,slide)
        const [person1,personDist1] = this.nearestPerson(point1)
        if(link1 === undefined || person1 === undefined) return false

        if(destDist1 < personDist1){
            // 先に目的地を選択した。これから人を選択する
            this.leftPanel.order("人をクリックしてください")
            const point2 = await this.editField.uiCanvas.getPoint()
            if(point2 === null) return false
            const [person2,_] = this.nearestPerson(point2)
            if(person2 === undefined) return false
            const befPerson = link1.person
            link1.person = person2
            this.pushUndo({
                do: () => {
                    link1.person = person2
                },
                undo: () => {
                    link1.person = befPerson
                }
            })
        }else{
            // 先に人を選択した。これから目的地を選択する
            this.leftPanel.order("目的地をクリックしてください")
            const point2 = await this.editField.uiCanvas.getPoint()
            if(point2 === null) return false
            const [link2,_] = this.nearestLink(point2,slide)
            if(link2 === undefined) return false
            const befPerson = link2.person
            link2.person = person1
            this.pushUndo({
                do: () => {
                    link2.person = person1
                },
                undo: () => {
                    link2.person = befPerson
                }
            })
        }
        return true
    }
    async startApplyColor(){
        this.editField.uiCanvas.cancel()
        this.leftPanel.clear()
        const persons = await this.startSelectRangePersons("色分けを適用する範囲を指定してください")
        this.editField.uiCanvas.clearAll()
        this.leftPanel.clear()
        if(persons === undefined) return true
        const person_colorPair: [Person,number][] = persons.map(person => [person,person.colorIndex])
        const colorIndex = this.rightPanel.setColorIndexWindow.getColorIndex()
        persons.forEach(person => {
            person.colorIndex = colorIndex
        })
        this.drawFirstFrame()
        this.pushUndo({
            do: () => {
                person_colorPair.forEach(([person,_]) => {
                    person.colorIndex = colorIndex
                })
                this.drawFirstFrame()
            },
            undo: () => {
                person_colorPair.forEach(([person,colorIndex]) => {
                    person.colorIndex = colorIndex
                })
                this.drawFirstFrame()
            }
        })
        return true
    }
    async startCheckId(){
        this.leftPanel.cancel()
        this.leftPanel.clear()

        this.leftPanel.setModeDispStr("番号確認")
        this.leftPanel.order("人をクリックするとidを確認できます。")
        const point = await this.editField.uiCanvas.getPoint()
        if(point === null) return false
        const [person,_] = this.nearestPerson(point)
        if(person === undefined) return false
        this.rightPanel.idWindow.setId(person.id)
        this.editField.uiCanvas.clearAll()
        this.editField.uiCanvas.drawSelect(person.state.pos)
        return true
    }
    startSelectRangePersons(order: string,isWithRotateAngleSelect = false,onRectRangeChange?: (p:[Point,Point]) => any,onParaRangeChange?: (p:[Point,Point,Point]) => any): Promise<Person[]|undefined>{
        this.leftPanel.clear()
        this.leftPanel.order(order)
        const clearEvents = () => {
            this.leftPanel.onRectRangeStart = ()=>{}
            this.leftPanel.onParaRangeStart = ()=>{}
        }
        return new Promise(resolve => {
            this.leftPanel.onRectRangeStart = async () => {
                this.editField.uiCanvas.cancel()

                const range = await this.editField.uiCanvas.getRect(onRectRangeChange)
                if(range === null) {
                    // resolve(undefined)
                    return
                }
                const persons = this.getPersonsInRect(range)
                clearEvents()
                resolve(persons)
            }
            this.leftPanel.onParaRangeStart = async () => {
                this.editField.uiCanvas.cancel()

                const range = await this.editField.uiCanvas.getPara(onParaRangeChange)
                if(range === null){
                    // resolve(undefined)
                    return
                }
                const persons = this.getPersonsInPara(range)
                clearEvents()
                resolve(persons)
            }
            this.leftPanel.dispRangeSelect()
            if(isWithRotateAngleSelect){
                console.log("rotateAngleSelect")
                this.leftPanel.dispRotateAngleSelect()
            }
            this.leftPanel.cancel = () => resolve(undefined)
        })
    }
    startSelectRangeDests(order: string,onRectRangeChange?: (p:[Point,Point]) => any,onParaRangeChange?: (p:[Point,Point,Point]) => any): Promise<Link[]>{
        this.leftPanel.clear()
        this.leftPanel.order(order)
        const clearEvents = () => {
            this.leftPanel.onRectRangeStart = ()=>{}
            this.leftPanel.onParaRangeStart = ()=>{}
        }
        return new Promise(resolve => {
            this.leftPanel.onRectRangeStart = async () => {
                this.editField.uiCanvas.cancel()

                const range = await this.editField.uiCanvas.getRect(p => onRectRangeChange?.(p))
                if(range === null) return false
                const dests = this.getDestsInRect(range)
                if(dests === undefined) return false
                clearEvents()
                resolve(dests)
            }
            this.leftPanel.onParaRangeStart = async () => {
                this.editField.uiCanvas.cancel()

                const range = await this.editField.uiCanvas.getPara(p => onParaRangeChange?.(p))
                if(range === null) return false
                const dests = this.getDestsInPara(range)
                if(dests === undefined) return false
                clearEvents()
                resolve(dests)
            }
            this.leftPanel.dispRangeSelect()
        })
    }
    resetId(targetSceneIndex: number){
        targetSceneIndex // define in project://src/App.ts
    }
    addNewPerson(startPos: Point): Person{
        let id = 1
        // idは単調増加
        if(this.scene.persons.length > 0){
            id = this.scene.persons[this.scene.persons.length-1].id+1
        }
        const newPerson = new Person(startPos,id)

        this.scene.persons.push(newPerson)
        this.onPersonsChanged(this.scene.persons.length)
        return newPerson
    }
    addNewPersons(...startPoses: Point[]){
        return startPoses.map(pos => {
            return this.addNewPerson(pos)
        })
    }
    addPersons(...persons: Person[]){
        this.scene.persons.push(...persons)
        this.onPersonsChanged(this.scene.persons.length)
    }
    removePersons(...persons: Person[]){
        const personsSet = new Set(persons)
        const removed = this.scene.persons.map(person => personsSet.has(person)?undefined:person)
        this.scene.persons = removed.filter(v => v !== undefined)
        this.onPersonsChanged(this.scene.persons.length)
    }
    addNewDests(slide: Slide,...poses: Point[]){
        const newLinks = poses.map(pos => new Link(pos))
        slide.links.push(...newLinks)
        return newLinks
    }
    removeLinks(slide: Slide,...links: Link[]){
        const personsSet = new Set(links)
        const removed = slide.links.map(link => personsSet.has(link)?undefined:link)
        slide.links = removed.filter(v => v !== undefined)
    }
    drawFirstFrame(){
        if(this.scene === undefined) return
        const firstFrame = createFirstFrame(this.scene)
        this.editField.personsCanvas.drawFrame(firstFrame)
        console.log(firstFrame)
    }
    nearestPerson(point: Point,maxDist?: number): [Person|undefined,number]{
        let minDist = Infinity
        let minDistPerson:Person|undefined
        this.scene.persons.forEach(person => {
            if(minDist > person.state.pos.distance(point)){
                minDist = person.state.pos.distance(point)
                minDistPerson = person
            }
        })
        if(maxDist !== undefined){
            if(minDist > maxDist) return [undefined,minDist]
        }
        return [minDistPerson,minDist]
    }
    getPrevScene(): Scene|undefined{
        return undefined// define in project://src/App.ts
    }
    getPersonsInRect(range: [Point,Point]){
        const sx = range[0].x
        const sy = range[0].y
        const ex = range[1].x
        const ey = range[1].y
        if(Math.abs((ex-sx) * (ey-sy)) <= 4){
            const person = this.nearestPerson(range[0],massCanvasDef.quarity)[0]
            if(person === undefined) return []
            return [person]
        }
        return this.scene.persons.filter(p => (p.state.pos.x - sx)*(p.state.pos.x - ex) <= 0 && (p.state.pos.y -sy)*(p.state.pos.y - ey) <= 0)
            .sort((p1,p2) => 
                p1.state.pos.sub(range[0]).toDiff().length() - p2.state.pos.sub(range[0]).toDiff().length()
            )
    }
    // MEMO もしめっちゃ細い平行四辺形にして、二辺が一次独立でなくなると選択されないので注意
    getPersonsInPara(range: [Point,Point,Point]){
        // vec_a,vec_bが成す平行四辺形内にあるかを係数を使って調べる
        // p2が始点
        const [p1,p2,p3] = range
        const vec_a = p1.sub(p2).toDiff()
        const vec_b = p3.sub(p2).toDiff()
        return this.scene.persons.filter(p => {
            const vec_p = p.state.pos.sub(p2).toDiff()
            const coefficients = solveSimulEq([
                [vec_a.x,vec_b.x,vec_p.x],
                [vec_a.y,vec_b.y,vec_p.y],
            ])
            if(coefficients === undefined) return false
            const [s,t] = coefficients
            if(0 <= s && s <= 1 && 0 <= t && t <= 1){
                return true
            }
            return false
        }).sort((a,b) => 
            a.state.pos.sub(p1).toDiff().length() - b.state.pos.sub(p1).toDiff().length()
        )
    }
    getDestsInRect(range: [Point,Point]){
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return
        
        const sx = range[0].x
        const sy = range[0].y
        const ex = range[1].x
        const ey = range[1].y
        return slide.links.filter(l => (l.absPos.x - sx)*(l.absPos.x - ex) <= 0 && (l.absPos.y -sy)*(l.absPos.y - ey) <= 0)
    }
    // MEMO もしめっちゃ細い平行四辺形にして、二辺が一次独立でなくなると選択されないので注意
    getDestsInPara(range: [Point,Point,Point]){
        // vec_a,vec_bが成す平行四辺形内にあるかを係数を使って調べる
        // p2が基準点
        const index = this.rightPanel.slideEditWindow.slideIndexSelect.elem.selectedIndex
        const slide = this.scene.slides[index]
        if(slide === undefined) return

        const [p1,p2,p3] = range
        const vec_a = p1.sub(p2).toDiff()
        const vec_b = p3.sub(p2).toDiff()
        return slide.links.filter(l => {
            const vec_p = l.absPos.sub(p2).toDiff()
            const coefficients = solveSimulEq([
                [vec_a.x,vec_b.x,vec_p.x],
                [vec_a.y,vec_b.y,vec_p.y],
            ])
            if(coefficients === undefined) return false
            const [s,t] = coefficients
            if(0 <= s && s <= 1 && 0 <= t && t <= 1){
                return true
            }
            return false
        })
    }
    nearestLink(point: Point,slide: Slide,maxDist?: number): [Link|undefined,number]{
        let minDist = Infinity
        let minDistLink: Link|undefined
        slide.links.forEach(link => {
            if(link.absPos === undefined) return
            const dist = link.absPos.distance(point)
            if(minDist > dist){
                minDist = dist
                minDistLink = link
            }
        })
        if(maxDist !== undefined){
            if(minDist > maxDist) return [undefined, minDist]
        }
        return [minDistLink,minDist]
    }
    onPersonsChanged(personsNum: number){
        this.leftPanel.setPeopleNum(personsNum)
    }
    pushUndoAddNewPersons(...persons: Person[]){
        this.pushUndo({
            do: () => {
                this.addPersons(...persons)
                this.drawFirstFrame()
            },
            undo: () => {
                this.removePersons(...persons)
                this.drawFirstFrame()
            }
        })
    }
    pushUndoAddNewDests(slide: Slide,...links: Link[]){
        this.pushUndo({
            do: () => {
                slide.links.push(...links)
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            },
            undo: () => {
                const linkSet = new Set(links)
                slide.links = slide.links.filter(l => !linkSet.has(l))
                this.editField.uiCanvas.clearAll()
                this.editField.uiCanvas.drawSlide(slide)
            }
        })
    }
    pushUndo(...func: UndoFunc[]){
        func// define in project://src/App.ts
    }
}