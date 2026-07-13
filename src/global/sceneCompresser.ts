import Macro from "./Macro";
import Person from "./Person";
import Point from "./Point";
import Scene from "./Scene";
import Slide, { Link } from "./Slide";
import { UUID } from "./utility";

export function compressScene(scene: Scene){
    const data: CompressedScene = {
        m: scene.macros.map(macro => macro.macroStr),
        l: scene.slides.map(slide => 
            slide.links.map<[number,number,number|undefined]>(link => 
                [link.absPos.x,link.absPos.y,link.person?.id]
            )
        ),
        p: scene.persons.map(person => [
            person.id,
            person.startState.pos.x,
            person.startState.pos.y,
            person.startState.rotateAngle,
            person.macroIndex,
            person.colorIndex,
            [
                person.variables.g,
                person.variables.h,
                person.variables.i,
                person.variables.j,
                person.variables.k,
                person.variables.l,
                person.variables.m,
                person.variables.n,
                person.variables.o,
                person.variables.p,
                person.variables.q,
                person.variables.r
            ],
            person.reverseFlag,
            person.inDisplay,
        ]),
        s: [...scene.slowSegments.values()].map(({seg,cpm}) => 
            [seg[0],seg[1],cpm]
        )
    }
    return JSON.stringify(data)
}
export function depressScene(json: string): Scene | null{
    const data = JSON.parse(json)
    if(!isCompressedScene(data)) return null
    const scene = new Scene()
    scene.macros = data.m.map(macroStr => new Macro(macroStr))
    scene.persons = data.p.map(([id,x,y,ang,macroIndex,colorIndex,variables,reverseFlag,inDisplay]) => {
        const person = new Person(new Point(x,y),id)
        person.startState.rotateAngle = ang
        person.macroIndex = macroIndex
        person.colorIndex = colorIndex
        {
          person.variables.g = variables[0]
          person.variables.h = variables[1]
          person.variables.i = variables[2]
          person.variables.j = variables[3]
          person.variables.k = variables[4]
          person.variables.l = variables[5]
          person.variables.m = variables[6]
          person.variables.n = variables[7]
          person.variables.o = variables[8]
          person.variables.p = variables[9]
          person.variables.q = variables[10]
          person.variables.r = variables[11]
          person.reverseFlag = reverseFlag
          person.inDisplay = inDisplay
        }
        return person
    })
    scene.slides = data.l.map(links => new Slide(
        links.map(([x,y,id]) => new Link(new Point(x,y),scene.persons.find(p => p.id === id)))
    ))
    scene.slowSegments =  new Map<UUID,{seg: [number,number],cpm: number}>(
        data.s.map(([seg0,seg1,cpm]) => {
            return [crypto.randomUUID(),{
                seg: [seg0,seg1],
                cpm: cpm
            }]
        })
    )
    return scene
}

type CompressedScene = {
  m: string[]
  l: [number, number, number | undefined][][]
  p: [number, number, number, number, number | undefined, number, [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
  ], boolean, boolean][]
  s: [number, number, number][]
}

function isNumber(v: any): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isStringArray(a: any): a is string[] {
  return Array.isArray(a) && a.every(x => typeof x === 'string')
}

function isTripleNumberTuple(t: any): t is [number, number, number] {
  return Array.isArray(t) && t.length === 3 && t.every(isNumber)
}

function isLInnerTuple(t: any): t is [number, number, number | undefined] {
  return Array.isArray(t) &&
    t.length === 3 &&
    isNumber(t[0]) &&
    isNumber(t[1]) &&
    (isNumber(t[2]) || typeof t[2] === 'undefined')
}

function isPMatrix12(t: any): t is [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
] {
  return Array.isArray(t) &&
    t.length === 12 &&
    t.every(isNumber)
}

function isPEntry(t: any): t is [number, number, number, number, number | undefined, number, number[], boolean, boolean] {
  if (!Array.isArray(t) || t.length !== 9) return false
  if (!isNumber(t[0])) return false
  if (!isNumber(t[1])) return false
  if (!isNumber(t[2])) return false
  if (!isNumber(t[3])) return false
  if (! (isNumber(t[4]) || typeof t[4] === 'undefined')) return false
  if (!isNumber(t[5])) return false
  // t[6] must be 12-number tuple (we accept Array but validate length and elements)
  if (!isPMatrix12(t[6])) return false
  if (!t[6].every(isNumber)) return false
  if (typeof t[7] !== 'boolean') return false
  if (typeof t[8] !== 'boolean') return false
  return true
}

export function isCompressedScene(obj: any): obj is CompressedScene {
  if (typeof obj !== 'object' || obj === null) return false

  // m
  if (!('m' in obj) || !isStringArray(obj.m)) return false

  // l
  if (!('l' in obj) || !Array.isArray(obj.l)) return false
  for (const row of obj.l) {
    if (!Array.isArray(row)) return false
    for (const item of row) {
      if (!isLInnerTuple(item)) return false
    }
  }

  // p
  if (!('p' in obj) || !Array.isArray(obj.p)) return false
  for (const entry of obj.p) {
    if (!isPEntry(entry)) return false
  }

  // s
  if (!('s' in obj) || !Array.isArray(obj.s)) return false
  for (const t of obj.s) {
    if (!isTripleNumberTuple(t)) return false
  }

  return true
}
