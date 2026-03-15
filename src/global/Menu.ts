import { CheckMenuItem, Menu, MenuItem, Submenu } from "@tauri-apps/api/menu"
import App from "../App"
import { openDlg_open_music, openDlg_read_msvi, openDlg_write_msvi } from "./fileOperations"
import { saveDataToScenes, scenesToSaveData } from "./CreateSaveData"
import { createPamphlet } from "../components/pamphlet/createPamphlet"
import PlayConditions from "./playConditions"
import { message } from "@tauri-apps/plugin-dialog"


let personSelectSettingVal:("rect"|"parallel"|"hold") = "rect"

export function getPersonSelectSettingVal(){
    return personSelectSettingVal
}
export default async function createMenu(app: App){
    const fileMenu = await Submenu.new({
        text: "ファイル",
        items: [
            {
                id: "open",
                text: "開く",
                accelerator: "Ctrl+O",
                action: () => menuFunctions.open(app)
            },
            {
                id: "openMusic",
                text: "音楽ファイルを開く",
                action: () => menuFunctions.openMusic(app)
            },
            {
                id: "save",
                text: "保存",
                accelerator: "Ctrl+S",
                action: () => menuFunctions.save(app)
            },
            {
                id: "print",
                text: "印刷",
                accelerator: "Ctrl+P",
                action: () => menuFunctions.print(app)
            }
        ]
    })
    const sceneList = await Submenu.new({
        text: "シーン一覧",
        items: [
            ...app.scenes.map((_,i) => {
                return {
                    id: "scene" + i,
                    text: `シーン${i+1}`,
                    action: () => {
                        app.setScene(i)
                    }
                }
            })
        ]
    })
    const sceneMenu = await Submenu.new({
        text: "シーン",
        items: [
            sceneList,
            {
                id: "gotoScenePage",
                text: "シーンページへ",
                accelerator: "Ctrl+Shift+G",
                action: () => menuFunctions.gotoScenePage(app)
            },
            {
                id: "gotoPrevScene",
                text: "前のシーンへ",
                accelerator: "Ctrl+Shift+ArrowLeft",
                action: () => menuFunctions.gotoPrevScene(app)
            },
            {
                id: "gotoNextScene",
                text: "次のシーンへ",
                accelerator: "Ctrl+Shift+ArrowRight",
                action: () => menuFunctions.gotoNextScene(app)
            },
            {
                id: "addSceneBefore",
                text: "このシーンの前にシーンを追加",
                accelerator: "Ctrl+Shift+B",
                action: () => menuFunctions.addSceneBefore(app)
            },
            {
                id: "addSceneAfter",
                text: "このシーンの後にシーンを追加",
                accelerator: "Ctrl+Shift+A",
                action: () => menuFunctions.addSceneAfter(app)
            },
            {
                id: "removeScene",
                text: "このシーンを削除",
                accelerator: "Ctrl+Shift+D",
                action: () => menuFunctions.removeScene(app)
            },
        ]
    })
    const playMenu = await Submenu.new({
        text: "再生",
        items: [
            {
                text: "マニュアル再生",
                accelerator: "Ctrl+M",
                action: () => {
                    app.play(false)
                }
            },
            {
                text: "自動再生",
                accelerator: "Ctrl+K",
                action: () => {
                    app.play(true)
                }
            },
            {
                text: "このシーンだけマニュアル再生",
                accelerator: "Ctrl+N",
                action: () => {
                    app.play(false,app.currentSceneIdx)
                }
            },
            {
                text: "このシーンだけ自動再生", 
                accelerator: "Ctrl+H",
                action: () => {
                    app.play(true,app.currentSceneIdx)
                }
            },
            {
                text: "停止",
                accelerator: "Esc",
                action: () => {
                    app.player.pause()
                    app.manualPlayer.pause()
                }
            }
        ]
    })

    // 選択設定
    const rectAlways = await CheckMenuItem.new({
        id: "rect",
        text: "常に矩形が初期値",
        checked: personSelectSettingVal === "rect",
        action: () => {
            personSelectSettingVal = "rect"
            rectAlways.setChecked(true)
            parallelAlways.setChecked(false)
            hold.setChecked(false)
        }
    })
    const parallelAlways = await CheckMenuItem.new({
        id: "parallel",
        text: "常に平行四辺形が初期値",
        checked: personSelectSettingVal === "parallel",
        action: () => {
            personSelectSettingVal = "parallel"
            rectAlways.setChecked(false)
            parallelAlways.setChecked(true)
            hold.setChecked(false)
        }
    })
    const hold = await CheckMenuItem.new({
        id: "hold",
        text: "前回の選択を保持",
        checked: personSelectSettingVal === "hold",
        action: () => {
            personSelectSettingVal = "hold"
            rectAlways.setChecked(false)
            parallelAlways.setChecked(false)
            hold.setChecked(true)
        }
    })

    const personSelectSettings = await Submenu.new({
        text: "選択設定",
        items: [rectAlways,parallelAlways,hold]
    })
    
    // 画面固定
    const lockAndRelease = await MenuItem.new({
        id: "lock-release",
        text: app.edit.editField.fixed?"解除":"固定",
        accelerator: app.edit.editField.fixed?"Ctrl+R":"Ctrl+L",
        action: () => {
            if(app.edit.editField.fixed){
                app.edit.editField.unFixLayer()
                lockAndRelease.setText("固定")
                lockAndRelease.setAccelerator("Ctrl+F")
            }else{
                app.edit.editField.fixLayer()
                lockAndRelease.setText("解除")
                lockAndRelease.setAccelerator("Ctrl+D")
            }
        }
    })
    const centering = await MenuItem.new({
        id: "centering",
        text: "中心固定",
        accelerator: "Ctrl+B",
        action: () => {
            app.edit.editField.fixLayerCenter()
        }
    })

    const justSeg = await CheckMenuItem.new({
        id: "justSeg",
        text: "区間のみスロー",
        checked: !app.segPlus1,
        action: () => {
            app.segPlus1 = false
            justSeg.setChecked(true)
            segPlus1.setChecked(false)
        }
    })
    const segPlus1 = await CheckMenuItem.new({
        id: "segPlus1",
        text: "区間プラス1スロー",
        checked: app.segPlus1,
        action: () => {
            app.segPlus1 = true
            justSeg.setChecked(false)
            segPlus1.setChecked(true)
        }
    })
    const slowSettings = await Submenu.new({
        text: "スロー設定",
        items: [justSeg,segPlus1]
    })


    const scrollAllow = await Submenu.new({
        text: "画面固定",
        items: [lockAndRelease,centering]
    })
    const menu = await Menu.new({
        items: [
            fileMenu,
            sceneMenu,
            {
                id: "undo",
                text: "Undo",
                action: () => {
                    app.undo.undo()
                }
            },
            {
                id: "redo",
                text: "Redo",
                action: () => {
                    app.undo.redo()
                }
            },
            playMenu,
            {
                id: "cpm",
                text: "BPM",
                action: () => menuFunctions.setBPM(app)
            },
            personSelectSettings,
            scrollAllow,
            slowSettings
        ]
    })
    menu.setAsAppMenu()
}
export namespace menuFunctions {
    // fileMenu
    export const open = (app: App) => {
        openDlg_read_msvi().then(saveData => {
            if(saveData === null) return
            const scenes = saveDataToScenes(saveData)
            app.edit.bottomPanel.timeLine.startCounts = {
                massStartCount: 0,
                musicStartCount: 0,
                ...saveData.startCounts
            }
            app.setScenes(scenes)
            app.edit.rightPanel.pamphSettings.checkeds = saveData.pamphSettings?.colorFills||[]
            app.setDefaultCpm(saveData.defaultCPM || 180)
            
        })
    }
    export const openMusic = async (app: App) => {
        const src = await openDlg_open_music()
        if(src === null){
            message("音楽ファイルが正しく読み込まれませんでした。")
            return
        }
        app.musicPlayer.setSrc(src)
    }
    export const save = (app: App) => {
        const ok = app.scenes.every((scene,i) => {
            if(!PlayConditions.macroOk(scene)){
                message(`シーン${i+1}にマクロが設定されていない人がいます。`)
                return false
            }
            if(!PlayConditions.countOk(scene)){
                message(`シーン${i+1}にカウント数が一致しない人がいます。`)
                return false
            }
            if(!PlayConditions.countZeroOk(scene)){
                message(`シーン${i+1}のカウント数が0です。カウント数が0のシーンを作ることはできません。`)
                return false
            }
            return true
        })
        if(ok){
            console.log("menu startCOunts",{...app.edit.bottomPanel.timeLine.startCounts})
            openDlg_write_msvi(scenesToSaveData(
                app.scenes,
                app.edit.rightPanel.pamphSettings.checkeds,
                app.defaultCpm,
                app.edit.bottomPanel.timeLine.startCounts,
            ))
        }
    }
    export const print = (app: App) => {
        const ok = app.scenes.every((scene,i) => {
            if(!PlayConditions.macroOk(scene)){
                message(`シーン${i+1}にマクロが設定されていない人がいます。`)
                return false
            }
            if(!PlayConditions.countOk(scene)){
                message(`シーン${i+1}にカウント数が一致しない人がいます。`)
                return false
            }
            if(!PlayConditions.countZeroOk(scene)){
                message(`シーン${i+1}のカウント数が0です。カウント数が0のシーンを作ることはできません。`)
                return false
            }
            return true
        })
        if(ok){
            app.resetId(0)
            const p = createPamphlet(app.scenes,app.edit.rightPanel.pamphSettings.checkeds)
            app.pamphElem.children.set(p)
            console.log(p)
            window.print()
        }else{
            
        }
    }
    // sceneMenu
    export const gotoScenePage = (app: App) => {
        app.scenePage.reload()
        app.pages.switchFocus(app.scenePage)
    }
    export const gotoPrevScene = (app: App) => {
        app.setScene(app.currentSceneIdx-1)
    }
    export const gotoNextScene = (app: App) => {
        app.setScene(app.currentSceneIdx+1)
    }
    export const addSceneBefore = (app: App) => {
        app.addSceneBefore()
    }
    export const addSceneAfter = (app: App) => {
        app.addSceneAfter()
    }
    export const removeScene = (app: App) => {
        app.removeScene()
    }
    // playMenuに関しては処理が単純すぎるのでショートカット側で直接書く
    
    export const setBPM = (app: App) => {
        const cpm = Number(prompt("BPMを入力",app.defaultCpm.toString()))
        if(Number.isNaN(cpm)) return
        app.setDefaultCpm(cpm)
    }
}