import { createTypirServices } from 'typir';
import type { AstNode } from 'langium';
import {
    isNumberLiteral,
    isBinaryExpression,
    isFunctionCall,
    isDeclaredParameter,
    isBooleanLiteral,
    isIfStatement,
    isDefinition,
} from './generated/ast.js';

export const typir = createTypirServices();

export const numberType = typir.factory.Primitives
    .create({ primitiveName: 'number' })
    .finish();

export const booleanType = typir.factory.Primitives
    .create({ primitiveName: 'boolean' })
    .finish();

const COMPARISON_OPS = new Set(['==', '!=', '<', '>', '<=', '>=']);
const activeDefinitions = new Set<AstNode>();

function inferDefinitionType(node: AstNode) {
    if (!isDefinition(node)) {
        return undefined;
    }

    if (activeDefinitions.has(node)) {
        return undefined;
    }

    activeDefinitions.add(node);
    try {
        return typir.Inference.inferType(node.expr);
    } finally {
        activeDefinitions.delete(node);
    }
}

typir.Inference.addInferenceRule((node: AstNode) => {

    if (isNumberLiteral(node)) {
        return numberType;
    }

    if (isBooleanLiteral(node)) {
        return booleanType;
    }

    if (isDeclaredParameter(node)) {
        return numberType;
    }

    if (isBinaryExpression(node)) {
        const leftType = typir.Inference.inferType(node.left);
        const rightType = typir.Inference.inferType(node.right);

        if (leftType === numberType && rightType === numberType) {
            // Comparison operators produce a boolean
            if (COMPARISON_OPS.has(node.operator)) {
                return booleanType;
            }
            // Arithmetic operators produce a number
            return numberType;
        }
    }

    if (isFunctionCall(node)) {
        const referenceTarget = node.func?.ref;
        if (!referenceTarget) {
            return undefined;
        }

        if (isDeclaredParameter(referenceTarget)) {
            return numberType;
        }

        return inferDefinitionType(referenceTarget);
    }

    if (isIfStatement(node)) {
        // If statements don't produce a value — only their condition type matters
        return undefined;
    }

    return undefined;
});
