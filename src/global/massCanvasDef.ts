import Point from "./Point"

export namespace massCanvasDef {
    // export const gridColor = "#33a"
    export const backGroundColor = "#2f2f2f"
    export const quarity = 24
    export const scenePageQuarity = 6
    export const centerGridColor = "#00f"
    export const exGridColor = "#888"
    export const gridRowsNum = 27
    export const gridColsNum = 35
    export const supGridWidth1 = 10 + 2/3
    export const supGridWidth2 = 20 + 4/3
    export const centerPoint = new Point(0,0)
    export const centerPx = new Point(massCanvasDef.gridColsNum-1,massCanvasDef.gridRowsNum-1).mul(3).add([2,2]).mul(massCanvasDef.quarity/2)// 設定によって容易に変わる
    export const dyclonLastR = supGridWidth2*massCanvasDef.quarity/2
    export const defRotateAngle = 90
    export const personMarkerColors = [
        "#fff",
        "rgb(255, 255, 0)",
        "rgb(255,0,0)",
        "rgb(0,255,255)",
        "rgb(255, 0, 208)",
        "rgb(0,255,0)",
        "rgb(255, 182, 127)",
        "hsl(289, 93.80%, 68.40%)",
        "hsl(215, 96.70%, 64.10%)",
    ]
    export const personMarkerColorNames = [
        "白",
        "黄",
        "赤",
        "水色",
        "マゼンタ",
        "緑",
        "薄橙",
        "パープル",
        "青",
    ]
    export const pamphPersonMarkerColors = [
        "#000",
        "rgb(255, 255, 0)",
        "rgb(255,0,0)",
        "rgb(0,255,255)",
        "rgb(255,0,255)",
        "rgb(0,255,0)",
        "rgb(255, 182, 127)",
        "hsl(289, 93.80%, 68.40%)",
        "hsl(215, 96.70%, 64.10%)",
    ]
    export const pamphFocusColor = "rgba(255,0,0,1)"
    export const pamphGridColor = "#888"
    export const pamphTraceWidth = 4
    export const pamphTraceColors = ["#000","#f00","rgb(0, 110, 255)","rgb(0, 210, 18)"]
    export const uiGoastColor = "rgba(255,255,255,0.5)"
    export const unselectablePersonMarkerColor = "#888"
    export const personMarkerR = 5
    export const largePersonMarkerR = 8
    export const scenePagePersonMarkerR = 2
    export const selectGridMarkerColor = "#f00"
    export const selectPersonMarkerColor = "#f00"
    export const shadowPersonMarkerColor = "#888"

    export const uiLineWidth = 3
    export const uiStrokeColor = "rgba(255,94,132,1)"
    export const uiFillColor = "rgba(255,94,132,0.5)"
    export const macroMarkDefColor = "rgb(255,255,255)"
    export const macroMarkColors = [
        "rgb(255,0,0)",
        "rgb(0,255,255)",
        "rgb(255,0,255)",
        "rgb(56, 34, 0)",
        "rgb(0, 255, 127)",
        "rgb(63, 63, 63)",
        "rgb(51, 70, 43)",
        "rgb(51, 71, 126)",
        "rgb(255, 102, 0)",
        "rgb(78, 24, 17)",
        "rgb(49, 40, 65)",
        "rgb(255, 196, 129)"
    ]
    export const slideDestMarkColor = "rgba(255,255,255,0.5)"
    export const slideLinkColor = "rgb(255, 255, 0)"
    // export const selectRectColor = "rgba(255,94,132,0.5)"
    // export const selectCircleColor = "rgb(47, 61, 50)"
    // export const deployLinerColor = "rgba(255,94,132,1)"
    export const dullMouseSensitivity = 0.07
    export const removePersonMaxDist = massCanvasDef.quarity
    export const removeDestMaxDist = massCanvasDef.quarity

    export type VariableName = 'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'
    export type Variables = {[key in VariableName]: number}
    export const defVars = (): Variables => {
        return {g:0,h:0,i:0,j:0,k:0,l:0,m:0,n:0,o:0,p:0,q:0,r:0}
    }
    export const varMarkDefColor = "rgb(255,255,255)"
    export const varMarkColors: {[key in VariableName] : string} = {
        "g": "rgb(255,0,0)",
        "h": "rgb(0,255,255)",
        "i": "rgb(255,0,255)",
        "j": "rgb(56, 34, 0)",
        "k": "rgb(0, 255, 127)",
        "l": "rgb(63, 63, 63)",
        "m": "rgb(51, 70, 43)",
        "n": "rgb(51, 71, 126)",
        "o": "rgb(255, 102, 0)",
        "p": "rgb(78, 24, 17)",
        "q": "rgb(49, 40, 65)",
        "r": "rgb(255, 196, 129)",
    }
}