import { createTypirServices } from 'typir';
import type { AstNode } from 'langium';
import { isNumberLiteral, isBinaryExpression, isFunctionCall,isDeclaredParameter} from './generated/ast.js';


export const typir = createTypirServices();

export const numberType = typir.factory.Primitives
    .create({ primitiveName: 'number' })
    .finish();

typir.Inference.addInferenceRule((node: AstNode) => {

    if (isNumberLiteral(node)) {
        return numberType;
    }

    if (isDeclaredParameter(node)) {
    return numberType;
}

    if (isBinaryExpression(node)) {

        const leftType = typir.Inference.inferType(node.left);
        const rightType = typir.Inference.inferType(node.right);

        if (leftType === numberType && rightType === numberType) {
            return numberType;
        }
    }

    if (isFunctionCall(node)) {
    const funcDef = node.func?.ref;

    if (!funcDef) return;

        return numberType; 
    }
   return numberType;
}
);