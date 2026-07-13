import { register, ShortcutEvent, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import App from '../App'
import { menuFunctions } from './Menu'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
let numberKeyOperations = Array(10).fill(0).map(() => ()=>{})
export function setNumKeyOperations(ops: ((()=>void)|undefined)[]){
    ops.slice(0,10).forEach((op,i) => {
        if(op !== undefined) numberKeyOperations[i] = op
    })
}
export default async function registerShortcutKey(app: App){
    unregisterAll()
    const ur = async (e: ShortcutEvent,unnamedFunction: ()=>void) => {
        if(e.state !== "Released") return
        const mainWindow = await WebviewWindow.getByLabel("main")
        if(!mainWindow?.isFocused()) return null
        unnamedFunction()
    }
    const up = async (e: ShortcutEvent,unnamedFunction: ()=>void) => {
        if(e.state !== "Pressed") return
        const mainWindow = await WebviewWindow.getByLabel("main")
        if(!mainWindow?.isFocused()) return null
        unnamedFunction()
    }
    // MEMO 再生中にシーン切り替えとかのショートカットキー押すと意味わからんことになるから注意
    await register("Ctrl+O",(e) => ur(e, ()=>menuFunctions.open(app)))
    await register("Ctrl+S", (e) => ur(e,()=>menuFunctions.save(app)))
    // await register("Ctrl+P", (e) => ur(e,()=>menuFunctions.print(app)))
    await register("Ctrl+Shift+G", (e) => ur(e,()=>menuFunctions.gotoScenePage(app)))
    await register("Ctrl+Shift+ArrowLeft", (e) => ur(e,()=>menuFunctions.gotoPrevScene(app)))
    await register("Ctrl+Shift+ArrowRight", (e) => ur(e,()=>menuFunctions.gotoNextScene(app)))
    await register("Ctrl+Shift+B", (e) => ur(e,()=>menuFunctions.addSceneBefore(app)))
    await register("Ctrl+Shift+A", (e) => ur(e,()=>menuFunctions.addSceneAfter(app)))
    await register("Ctrl+Shift+D", (e) => ur(e,()=>menuFunctions.removeScene(app)))
    await register("Ctrl+Z", (e) => ur(e,()=>app.undo.undo()))
    await register("Ctrl+Y", (e) => ur(e,()=>app.undo.redo()))
    await register("Ctrl+K", (e) => ur(e,()=>app.play(true)))
    await register("Ctrl+M", (e) => ur(e,()=>app.play(false)))
    await register("Ctrl+N", (e) => ur(e,()=>app.play(false,app.currentSceneIdx)))
    await register("Ctrl+H", (e) => ur(e,()=>app.play(true,app.currentSceneIdx)))
    await register("Ctrl+F", (e) => ur(e,()=>app.edit.editField.fixLayer()))
    await register("Ctrl+D", (e) => ur(e,()=>app.edit.editField.unFixLayer()))
    await register("Ctrl+B", (e) => ur(e,()=>app.edit.editField.fixLayerCenter()))
    await register("Esc", (e) => ur(e,()=>{app.player.pause();app.manualPlayer.pause()}))
    await register("Ctrl+Space", (e) => ur(e,()=>{app.edit.leftPanel.toggleRangeSelect()}))
    await register("Ctrl+L", (e) => ur(e,()=>{app.edit.editField.zoomCanvas.toggleZoomable()}))
    await register("Ctrl+Shift+C", (e) => ur(e,()=>{menuFunctions.copyScene(app)}))
    await register("Ctrl+Shift+V", (e) => ur(e,()=>{menuFunctions.pasteScene(app)}))

    numberKeyOperations.forEach(async (_,i) => {
        await register(`Alt+${i}`,e => up(e,() => numberKeyOperations[i]()))
    })
} 