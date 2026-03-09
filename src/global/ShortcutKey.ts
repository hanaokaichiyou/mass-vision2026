import { register, ShortcutEvent, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import App from '../App'
import { menuFunctions } from './Menu'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
export default async function registerShortcutKey(app: App){
    unregisterAll()
    const u = async (e: ShortcutEvent,unnamedFunction: ()=>void) => {
        if(e.state !== "Released") return
        const mainWindow = await WebviewWindow.getByLabel("main")
        if(!mainWindow?.isFocused()) return null
        unnamedFunction()
    }
    // MEMO 再生中にシーン切り替えとかのショートカットキー押すと意味わからんことになるから注意
    await register("Ctrl+O",(e) => u(e, ()=>menuFunctions.open(app)))
    await register("Ctrl+S", (e) => u(e,()=>menuFunctions.save(app)))
    await register("Ctrl+P", (e) => u(e,()=>menuFunctions.print(app)))
    await register("Ctrl+Shift+G", (e) => u(e,()=>menuFunctions.gotoScenePage(app)))
    await register("Ctrl+Shift+ArrowLeft", (e) => u(e,()=>menuFunctions.gotoPrevScene(app)))
    await register("Ctrl+Shift+ArrowRight", (e) => u(e,()=>menuFunctions.gotoNextScene(app)))
    await register("Ctrl+Shift+B", (e) => u(e,()=>menuFunctions.addSceneBefore(app)))
    await register("Ctrl+Shift+A", (e) => u(e,()=>menuFunctions.addSceneAfter(app)))
    await register("Ctrl+Shift+D", (e) => u(e,()=>menuFunctions.removeScene(app)))
    await register("Ctrl+Z", (e) => u(e,()=>app.undo.undo()))
    await register("Ctrl+Y", (e) => u(e,()=>app.undo.redo()))
    await register("Ctrl+K", (e) => u(e,()=>app.play()))
    await register("Ctrl+M", (e) => u(e,()=>app.manualPlay()))
    await register("Ctrl+H", (e) => u(e,()=>app.play(app.currentSceneIdx)))
    await register("Esc", (e) => u(e,()=>{app.player.pause();app.manualPlayer.pause()}))
    // await register("", () => )
} 