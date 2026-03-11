import PamphSettings from "../components/Edit/rightPanel/pamphSettings"

export type saveData_t = {
    scenes: saveDataScene_t[]
    pamphSettings?: saveDataPamphSettings_t
    defaultCPM?: number
}
export type saveDataScene_t = {
    macros: saveDataMacro_t[]
    slides: saveDataSlide_t[]
    persons: saveDataPerson_t[]
    slowSegments?: saveDataSlowSegments_t[]
}
export type saveDataMacro_t = {
    macroStr: string
}
export type saveDataSlide_t = {
    links: saveDataLink_t[]
}
export type saveDataLink_t = {
    personIndex: number|undefined
    absPos: saveDataPoint_t
}
export type saveDataPerson_t = {
    id: number
    macroIndex: number|undefined
    reverseFlag?: boolean
    startState: {
        pos: saveDataPoint_t
        rotateAngle: number
    }
    inDisplay: boolean
    colorIndex: number
    variables?: saveVars
}
export type saveDataSlowSegments_t = {
    seg: [number,number],
    cpm: number
}
export type saveVars = {
    g?: number
    h?: number
    i?: number
    j?: number
    k?: number
    l?: number
    m?: number
    n?: number
    o?: number
    p?: number
    q?: number
    r?: number
}
export type saveDataPoint_t = {
    x: number
    y: number
}
export type saveDataPamphSettings_t = {
    // MEMO 色の種類を増やしたり変えたりするとひどいことになるので注意
    colorFills: boolean[]
}
export function isSaveData(value: any): value is saveData_t {
  if(typeof value === "object")
  if(value !== null)
  if(Object.keys(value).length <= 3)
  if("scenes" in value)
  if(Array.isArray(value.scenes))
  if(value.scenes.every(isSaveDataScene))
  if(value.pamphSettings === undefined || isPamphSettings(value.pamphSettings))
  if(value.defaultCPM === undefined || typeof value.defaultCPM === "number")
    return true
  return false
}

export function isSaveDataScene(value: any): value is saveDataScene_t {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    if(Object.keys(value).length > 4) return false
    // macrosのチェック
    if (!Array.isArray(value.macros) || !value.macros.every(isSaveDataMacro)) {
        return false;
    }

    // slidesのチェック
    if (!Array.isArray(value.slides) || !value.slides.every(isSaveDataSlide)) {
        return false;
    }

    // personsのチェック
    if (!Array.isArray(value.persons) || !value.persons.every(isSaveDataPerson)) {
        return false;
    }

    // slowSegmentsのチェック
    if(value.slowSegments !== undefined && ( !Array.isArray(value.slowSegments) || !value.slowSegments.every(isSaveDataSlowSegments) ))
        return false

    return true;
}

function isSaveDataMacro(value: any): value is saveDataMacro_t {
    return typeof value === "object" && value !== null && typeof value.macroStr === "string";
}

function isSaveDataSlide(value: any): value is saveDataSlide_t {
    return typeof value === "object" && value !== null && Array.isArray(value.links) && value.links.every(isSaveDataLink);
}

function isSaveDataLink(value: any): value is saveDataLink_t {
    return (
        typeof value === "object" &&
        value !== null &&
        (typeof value.personIndex === "number" || value.personIndex === undefined) &&
        (isSaveDataPoint(value.absPos))
    );
}

function isSaveDataPerson(value: any): value is saveDataPerson_t {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.id === "number" &&
        (typeof value.macroIndex === "number" || value.macroIndex === undefined) &&
        (value.reverseFlag === undefined || typeof value.reverseFlag === "boolean") &&
        typeof value.inDisplay === "boolean" &&
        typeof value.colorIndex === "number" &&
        typeof value.startState === "object" &&
        value.startState !== null &&
        isSaveDataPoint(value.startState.pos) &&
        (value.variables === undefined || isSaveVars(value.variables)) &&
        typeof value.startState.rotateAngle === "number"
    );
}
function isSaveVars(obj: any): obj is saveVars {
    const validKeys = new Set(['g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r']);
    
    for (const key of Object.keys(obj)) {
        if (!validKeys.has(key)) return false
    }

    return (
        obj &&
        (obj.g === undefined || typeof obj.g === 'number') &&
        (obj.h === undefined || typeof obj.h === 'number') &&
        (obj.i === undefined || typeof obj.i === 'number') &&
        (obj.j === undefined || typeof obj.j === 'number') &&
        (obj.k === undefined || typeof obj.k === 'number') &&
        (obj.l === undefined || typeof obj.l === 'number') &&
        (obj.m === undefined || typeof obj.m === 'number') &&
        (obj.n === undefined || typeof obj.n === 'number') &&
        (obj.o === undefined || typeof obj.o === 'number') &&
        (obj.p === undefined || typeof obj.p === 'number') &&
        (obj.q === undefined || typeof obj.q === 'number') &&
        (obj.r === undefined || typeof obj.r === 'number')
    );
}

function isSaveDataPoint(value: any): value is saveDataPoint_t {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.x === "number" &&
        typeof value.y === "number"
    );
}
function isPamphSettings(data: any): data is PamphSettings {
    return Array.isArray(data.colorFills) && (data.colorFills as []).every(item => typeof item === 'boolean');
}
function isSaveDataSlowSegments(value: any): value is saveDataSlowSegments_t {
    return true
    return (
        typeof value === "object" &&
        value !== null &&
        Object.keys(value).length === 2 &&
        "seg" in value &&
        "cpm" in value &&
        Array.isArray(value.seg) &&
        value.seg.length === 2 &&
        value.seg.every((v:any) => typeof v === "number") &&
        typeof value.cpm === "number"
    )
}