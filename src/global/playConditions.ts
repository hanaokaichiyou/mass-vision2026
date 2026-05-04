import { createFrames } from "./CreateFrames";
import Scene from "./Scene";

export default class PlayConditions {
    constructor(){

    }
    // こっちが1st
    static macroOk(scene: Scene){
        return scene.persons.every(p => p.macroIndex !== undefined && scene.macros[p.macroIndex] !== undefined)
    }
    // こっちが2nd
    static countOk(scene: Scene){
        if(scene.persons.length == 0) return true
        const firstIndex = scene.persons[0]?.macroIndex
        if(firstIndex === undefined) return false
        const firstCnt = scene.macros[firstIndex]?.totalCount(scene.persons[0].variables)
        if(firstCnt === undefined) return false
        return scene.persons.every(p => {
            const index = p.macroIndex
            if(index === undefined) return false
            const cnt = scene.macros[index]?.totalCount(p.variables)
            if(cnt === undefined) return false
            return cnt === firstCnt 
        })
    }
    // これが3rd
    static countZeroOk(scene: Scene){
        return scene.persons.every(p => {
            const index = p.macroIndex
            if(index === undefined) return false
            const cnt = scene.macros[index]?.totalCount(p.variables)
            if(cnt === undefined) return false
            return cnt > 0
        })
    }
    static overlappingFrames(scene: Scene){
        const frames = createFrames([scene],1,0,0)
        return frames?.[0].map((frame,frameNum) => {
            const posIdMap = new Map<string,number[]>()
            let overlapped = false
            frame.statePersonPairs.forEach(({person,state}) => {
                const posStr = `${state.pos.x},${state.pos.y}`
                const idArr = posIdMap.get(posStr) || []
                if(idArr.length > 0) overlapped = true
                idArr.push(person.id)
                posIdMap.set(posStr,idArr)
            })
            return overlapped?{
                frameNum: frameNum,
                overlappingPersonIds: [...posIdMap.values()].filter(v => v.length >= 2)
            }:undefined
        }).filter(v => v !== undefined)
    }
}