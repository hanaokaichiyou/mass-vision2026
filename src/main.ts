import { Narve, nr } from "narve"
import App from "./App"
import registerShortcutKey from "./global/ShortcutKey"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { unregisterAll } from "@tauri-apps/plugin-global-shortcut"

window.onload = async () => {
  const root = Narve.q("body")
  root.children.set(nr("div",{id: "pamphElem"}))
  const app = new App()
  root.children.push(app)
  app.edit.editField.fixLayerCenter()
  
  // mainWindowにフォーカスされたタイミングでショートカットを登録する
  const mainWindow = await WebviewWindow.getByLabel("main")
  mainWindow?.onFocusChanged(({payload: focued}) => {
    if(focued) registerShortcutKey(app)
    else unregisterAll()
  })
  // リロード時にもショートカットを再登録する
  registerShortcutKey(app)
}