/**makes thes utils usable from ScalablyTyped perspective */
import { CstUtils,AstUtils} from 'langium'
export {CstUtils,AstUtils}


import type { ResolvedReference } from 'langium';
import { isDefinition, type BinaryExpression, type Definition, type FunctionCall } from './generated/ast.js';

export function applyOp(op: BinaryExpression['operator']): (x: number, y: number) => number {
    switch (op) {
        case '+': return (x, y) => x + y;
        case '-': return (x, y) => x - y;
        case '*': return (x, y) => x * y;
        case '^': return (x, y) => Math.pow(x, y);
        case '%': return (x, y) => x % y;
        case '/': return (x, y) => {
            if (y === 0) {
                throw new Error('Division by zero');
            }
            return x / y;
        };
        default: throw new Error('Unknown operator: ' + op);
    }
}

export type ResolvedFunctionCall = FunctionCall & {
    func: ResolvedReference<Definition>
}

export function isResolvedFunctionCall(functionCall: FunctionCall): functionCall is ResolvedFunctionCall {
    return isDefinition(functionCall.func.ref);
}