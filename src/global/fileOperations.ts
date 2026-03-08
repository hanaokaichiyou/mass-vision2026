import { open, save } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, readFile, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isSaveData, saveData_t } from "./SaveDataType";

export async function openDlg_read_msvi(): Promise<saveData_t|null>{
    const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Mass-Vision-File',
            extensions: ['msvi'],
          },
          {
            name: 'All',
            extensions: ['*'],
          },
        ],
    })
    if(selected){
        const res = JSON.parse(await readTextFile(selected, { baseDir: BaseDirectory.AppConfig }))
        console.log(res)
        if(isSaveData(res)){
          return res
        }else{
          console.warn("invalid data")
          return null
        }
    }
    return null
}
export async function openDlg_write_msvi(saveData: saveData_t) {
  const selected = await save({
    filters: [
      {
        name: 'Mass-Vision-File',
        extensions: ['msvi'],
      },
      {
        name: 'All',
        extensions: ['*'],
      },
    ],
  })
  if(selected){
    await writeTextFile(selected,JSON.stringify(saveData), { baseDir: BaseDirectory.AppConfig })
  }
}
export async function openDlg_open_music(): Promise<string|null>{
    const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'audio file',
            extensions: ['mp3'],
          },
          {
            name: 'All',
            extensions: ['*'],
          },
        ],
    })
    if(selected){
      const contents_u8 = await readFile(selected, { baseDir: BaseDirectory.AppConfig })
      const blob = new Blob([contents_u8], {type: "application/octet-binary"})
      return URL.createObjectURL(blob)
    }
    return selected
}