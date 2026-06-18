export namespace MathExp {
type Node = NumberNode | OpNode | VariableNode | FuncNode

type NumberNode = {
    type: 'number',
    value: number
}

type OpNode = {
    type: 'operator',
    value: OpToken,
    left: Node,
    right: Node
}

type FuncNode = {
    type: 'function',
    value: FuncToken,
    arg: Node
}

type VariableNode = {
    type: 'variable',
    value: string
}

type OpToken = '+' | '-' | '*' | '/' | '%'

type FuncToken =
    | 'sin'
    | 'cos'
    | 'tan'
    | 'atan'
    | 'sqrt'
    | 'abs'
    | 'floor'
    | 'ceil'
    | 'round'

type StackToken = OpToken | FuncToken | '('

function isOpToken(t: any): t is OpToken {
    return typeof t === "string" && ['+', '-', '*', '/', '%'].includes(t)
}

function isFuncToken(t: any): t is FuncToken {
    return typeof t === "string" && [
        'sin',
        'cos',
        'tan',
        'atan',
        'sqrt',
        'abs',
        'floor',
        'ceil',
        'round'
    ].includes(t)
}

export const expReg = /\s*(?:[()+\-*/%]|\d+(?:\.\d+)?|\w+)\s*/
// MEMO よく考えたら負の数扱えないから0-xって書かんといけん

export class ExpressionTree {
    private root: Node | null = null
    private expression: string

    constructor(expression: string) {
        this.expression = expression
        this.root = this.parseExpression(expression)
    }

    private parseExpression(expression: string): Node {
        const tokens = this.tokenize(expression)
        return this.buildTree(tokens)
    }

    // エラーを吐きうる
    private tokenize(expression: string): string[] {
        const regex = /\s*([()+\-*/%]|\d+(?:\.\d+)?|\w+)\s*/g
        const tokens = expression
            .match(regex)
            ?.map(token => token.trim())
            .filter(token => token.length > 0)

        if (!tokens) {
            throw new Error("Expression is empty or invalid.")
        }

        return tokens
    }

    private buildTree(tokens: string[]): Node {
        const opStack: StackToken[] = []
        const output: Node[] = []

        const precedence: { [key in OpToken]: number } = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '%': 2
        }

        const applyOperator = (operator: OpToken) => {
            const right = output.pop()
            const left = output.pop()

            if (!left || !right) {
                throw new Error(`Invalid expression around operator ${operator}.`)
            }

            output.push({
                type: 'operator',
                value: operator,
                left,
                right
            })
        }

        const applyFunction = (func: FuncToken) => {
            const arg = output.pop()

            if (!arg) {
                throw new Error(`Function ${func} requires an argument.`)
            }

            output.push({
                type: 'function',
                value: func,
                arg
            })
        }

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]

            if (!isNaN(Number(token))) {
                output.push({
                    type: 'number',
                    value: Number(token)
                })
            } else if (isFuncToken(token)) {
                opStack.push(token)
            } else if (isOpToken(token)) {
                let lastOp: StackToken

                while (
                    opStack.length &&
                    (lastOp = opStack[opStack.length - 1]) !== '(' &&
                    isOpToken(lastOp) &&
                    precedence[lastOp] >= precedence[token]
                ) {
                    applyOperator(lastOp)
                    opStack.pop()
                }

                opStack.push(token)
            } else if (token === '(') {
                opStack.push(token)
            } else if (token === ')') {
                let lastOp: StackToken

                while (
                    opStack.length &&
                    (lastOp = opStack[opStack.length - 1]) !== '('
                ) {
                    if (isOpToken(lastOp)) {
                        applyOperator(lastOp)
                    } else if (isFuncToken(lastOp)) {
                        throw new Error(`Invalid function call near ${lastOp}.`)
                    }

                    opStack.pop()
                }

                if (!opStack.length) {
                    throw new Error("Invalid brackets.")
                }

                opStack.pop() // remove '('

                // 閉じ括弧の直前が関数呼び出しだった場合
                const maybeFunc = opStack[opStack.length - 1]
                if (isFuncToken(maybeFunc)) {
                    applyFunction(maybeFunc)
                    opStack.pop()
                }
            } else {
                if (token.match(/^\d.*$/) !== null) {
                    throw new Error(
                        `Invalid variable name ${token}. Variable name mustn't be started with number.`
                    )
                }

                output.push({
                    type: 'variable',
                    value: token
                })
            }
        }

        while (opStack.length) {
            const lastOp = opStack.pop()!

            if (lastOp === '(') {
                throw new Error("Invalid brackets.")
            }

            if (isOpToken(lastOp)) {
                applyOperator(lastOp)
            } else if (isFuncToken(lastOp)) {
                applyFunction(lastOp)
            }
        }

        if (output.length !== 1) {
            throw new Error("Invalid expression.")
        }

        return output[0]
    }

    public get source() {
        return this.expression
    }

    public evaluate(
        variables: { [key: string]: number },
        isReturnInt: boolean = false
    ): number {
        if (!this.root) {
            throw new Error("Expression tree is empty")
        }

        const result = this.evaluateNode(this.root, variables)

        if (isReturnInt) {
            return Math.round(result)
        }

        return result
    }

    private evaluateNode(
        node: Node,
        variables: { [key: string]: number }
    ): number {
        switch (node.type) {
            case 'number':
                return node.value

            case 'variable':
                if (node.value in variables) {
                    return variables[node.value]
                } else {
                    throw new Error(`Variable ${node.value} is not defined`)
                }

            case 'operator': {
                const leftValue = this.evaluateNode(node.left, variables)
                const rightValue = this.evaluateNode(node.right, variables)

                switch (node.value) {
                    case '+':
                        return leftValue + rightValue
                    case '-':
                        return leftValue - rightValue
                    case '*':
                        return leftValue * rightValue
                    case '/':
                        return leftValue / rightValue
                    case '%':
                        return leftValue % rightValue
                }
            }

            case 'function': {
                const argValue = this.evaluateNode(node.arg, variables)

                switch (node.value) {
                    case 'sin':
                        return Math.sin(argValue)
                    case 'cos':
                        return Math.cos(argValue)
                    case 'tan':
                        return Math.tan(argValue)
                    case 'atan':
                        return Math.atan(argValue)
                    case 'sqrt':
                        return Math.sqrt(argValue)
                    case 'abs':
                        return Math.abs(argValue)
                    case 'floor':
                        return Math.floor(argValue)
                    case 'ceil':
                        return Math.ceil(argValue)
                    case 'round':
                        return Math.round(argValue)
                }
            }
        }
    }
}
}