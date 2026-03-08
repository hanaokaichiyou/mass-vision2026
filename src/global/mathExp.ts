export namespace MathExp {
type Node = NumberNode | OpNode | VariableNode
type NumberNode = {
    type: 'number',
    value: number
}
type OpNode = {
    type: 'operator',
    value: opToken, 
    left: Node,
    right: Node
}
type opToken = '+'|'-'|'*'|'/'|'%'
type opSplitToken = opToken | '(' 
function isOpToken(t:any) : t is opToken{
    return typeof t === "string" && ['+','-','*','/','%'].includes(t)
}
// type FuncNode = {
//     type: 'function',
//     value: string, // TODO 列挙
//     left: Node
// }
type VariableNode = {
    type: 'variable',
    value: string
}
export const expReg = /\s*(?:[()+\-*/%]|\d+|\w+)\s*/
// MEMO よく考えたら負の数扱えないから0-xって書かんといけん
// TODO 正しい数式でないときにエラーが出ないことがあるので、できれば修正する。正しい数式のときは動くので別になくてもいい
export class ExpressionTree { 
    private root: Node | null = null; 
    private expression: string
    constructor(expression: string) { 
        this.expression = expression
        this.root = this.parseExpression(expression)
    } 
    private parseExpression(expression: string): Node { 
        const tokens = this.tokenize(expression)
        return this.buildTree(tokens)
    } 
    private tokenize(expression: string): string[] { 
        const regex = /\s*([()+\-*/%]|\d+|\w+)\s*/g
        return expression.match(regex)!.map(token => token.trim()).filter(token => token.length > 0); 
    } 
    private buildTree(tokens: string[]): Node { 
        const opStack: opSplitToken[] = []; 
        const output: Node[] = []; 
        const precedence: { [key in opToken]: number } = { 
            '+': 1, 
            '-': 1, 
            '*': 2, 
            '/': 2, 
            '%': 2
        }; 
        const applyOperator = (operator: opToken) => { 
            const right = output.pop()!; 
            const left = output.pop()!; 
            output.push({ type: 'operator', value: operator, left, right }); 
        }; 
        for (const token of tokens) { 
            if (!isNaN(Number(token))) { 
                output.push({ type: 'number', value: Number(token) }); 
            } else if (isOpToken(token)) { 
                let lastOp: opSplitToken
                while (opStack.length && (lastOp = opStack[opStack.length - 1]) !== '(' && precedence[lastOp] >= precedence[token]) { 
                    applyOperator(lastOp)
                    opStack.pop()
                } 
                opStack.push(token); 
            } else if (token === '(') { 
                opStack.push(token); 
            } else if (token === ')') { 
                let lastOp: opSplitToken
                while (opStack.length && (lastOp = opStack[opStack.length - 1]) !== '(') { 
                    applyOperator(lastOp)
                    opStack.pop() 
                } 
                opStack.pop(); // remove the '('
            } else { 
                if(token.match(/^\d.*$/) !== null) throw new Error(`Invalid variable name ${token}. Variable name mustn't be started with number.`)
                output.push({ type: 'variable', value: token }); 
            } 
        } 
        while (opStack.length) {
            const lastOp = opStack.pop()!
            if(lastOp !== '('){
                applyOperator(lastOp)
            }else{
                throw new Error("Invalid brackets.")
            }
        } 
        return output[0]; 
    } 
    public get source(){
        return this.expression
    }
    public evaluate(variables: { [key: string]: number },isReturnInt: boolean = false): number { 
        if (!this.root) throw new Error("Expression tree is empty"); 
        if(isReturnInt) return Math.round(this.evaluateNode(this.root,variables))
        return this.evaluateNode(this.root, variables); 
    } 
    private evaluateNode(node: Node, variables: { [key: string]: number }): number { 
        switch (node.type) { 
            case 'number': return node.value
            case 'variable': 
                if (node.value in variables) { 
                    return variables[node.value];
                } else { 
                    throw new Error(`Variable ${node.value} is not defined`)
                }
            case 'operator': 
                const leftValue = this.evaluateNode(node.left!, variables)
                const rightValue = this.evaluateNode(node.right!, variables)
                switch (node.value) { 
                    case '+': return leftValue + rightValue
                    case '-': return leftValue - rightValue
                    case '*': return leftValue * rightValue
                    case '/': return leftValue / rightValue
                    case '%': return leftValue % rightValue
                    default: throw new Error(`Unknown operator ${node}`)
                }
            // case 'function': 
            //     const argValue = this.evaluateNode(node.left!, variables); 
            //     switch (node.value) { 
            //         case 's(': return Math.sin(argValue); 
            //         case 'c(': return Math.cos(argValue); 
            //         case 't(': return Math.tan(argValue); 
            //         case 'at(': return Math.atan(argValue); 
            //         case 'r(': return Math.sqrt(argValue); 
            //         case 'a(': return Math.abs(argValue); 
            //         default: throw new Error(`Unknown function ${node.value}`); 
            //     } 
        }
    } 
}
const test = () => {
    const rndNum = () => {
        return Math.floor(Math.random()*100).toString()
    }
    const rndVar = () => {
        const vars = ['n','m','l']
        return vars[Math.floor(Math.random()*vars.length)]
    }
    const rndMono = () => {
        return Math.random() > 0.3
        ? rndNum()
        : rndVar()
    }
    const rndOp = () => {
        const ops = ['+','-','*','/','%']
        return ops[Math.floor(Math.random()*ops.length)]
    }
    const rndPoly = () => {
        return Math.random() > 0.3
        ? rndNum()
        : rndMathExp(rndMono)
    }
    const rndMathExp = (createBlacket: ()=>string) => {
        let n = Math.floor(Math.random()*10)+1
        let s = ""
        while(n--){
            s += createBlacket()
            if(n) s += rndOp()
        }
        return `${s}`
    }
    
    let Q = 1000
    let wrong = false
    while(Q--){
        const form = rndMathExp(rndPoly)
        const t = new ExpressionTree(form)
        const n = Number(rndNum())
        const m = Number(rndNum())
        const l = Number(rndNum())
        if(Math.abs(eval(form) - t.evaluate({n:n, m:m, l:l},false)) > 0.00001){
            wrong = true
            break
        }
    }
    console.log(wrong?"WA":"AC")
}
test// 使ってないじゃんエラーの回避
}

