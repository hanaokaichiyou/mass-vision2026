import Macro from "./Macro"
import Person from "./Person"
import { saveData_t, saveDataMacro_t, saveDataPerson_t, saveDataSlide_t } from "./SaveDataType"
import Scene from "./Scene"
import Slide, { Link } from "./Slide"
import Point from "./Point"
import { massCanvasDef as ms} from "./massCanvasDef"

export function scenesToSaveData(scenes: Scene[],colorFill: boolean[],defaultCPM: number): saveData_t {
  
  return {
    scenes: scenes.map(scene => {
      const personIndexMap = new Map<Person,number>()
      scene.persons.forEach((person,i) => {
        personIndexMap.set(person,i)
      })
      return {
        macros: scene.macros.map<saveDataMacro_t>(macro => {
          return {
            macroStr: macro.macroStr
          }
        }),
        slides: scene.slides.map<saveDataSlide_t>(slide => {
          return {
            links: slide.links.map(link => {
              return {
                personIndex: link.person !== undefined? personIndexMap.get(link.person) : undefined,
                absPos: {
                  x: link.absPos.x,
                  y: link.absPos.y
                }
              }
            })
          }
        }),
        persons: scene.persons.map<saveDataPerson_t>(person => {
          return {
            id: person.id,
            macroIndex: person.macroIndex,
            reverseFlag: person.reverseFlag,
            startState: {
              pos: {
                x: person.startState.pos.x,
                y: person.startState.pos.y
              },
              rotateAngle: person.startState.rotateAngle
            },
            inDisplay: person.inDisplay,
            colorIndex: person.colorIndex,
            variables: person.variables
          }
        }),
        slowSegments: [...scene.slowSegments.values()]
      }
    }),
    pamphSettings: {
      colorFills: colorFill
    },
    defaultCPM: defaultCPM
  }
}
export function saveDataToScenes(saveData: saveData_t): Scene[] {
  return saveData.scenes.map((svScene) => {
    const persons = svScene.persons.map((svPerson) => {
      const pos = svPerson.startState.pos
      const person = new Person(new Point(pos.x,pos.y),svPerson.id)
      person.startState.rotateAngle = svPerson.startState.rotateAngle
      person.macroIndex = svPerson.macroIndex
      if(svPerson.reverseFlag !== undefined){
        person.reverseFlag = svPerson.reverseFlag
      }else{
        person.reverseFlag = false
      }
      person.colorIndex = svPerson.colorIndex
      person.inDisplay = svPerson.inDisplay
      person.variables = {
        ...ms.defVars(),
        ...svPerson.variables
      }
      return person
    })

    const scene = new Scene()
    
    scene.macros = svScene.macros.map(svMacro => {
      return new Macro(svMacro.macroStr)
    })
    
    scene.slides = svScene.slides.map(svSlide => {
      const links = svSlide.links.map(svLink => {
        const point = new Point(svLink.absPos.x,svLink.absPos.y)
        const index = svLink.personIndex
        const person = index !== undefined ? persons[index] : undefined
        return new Link(point,person)
      })
      const slide = new Slide()
      slide.links = links
      return slide
    })
    
    scene.persons = persons

    scene.slowSegments = new Map(svScene.slowSegments?.map(slowSeg => {
      return [crypto.randomUUID(),slowSeg]
    }))

    return scene
  })
}