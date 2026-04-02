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
        const funcDef = node.func?.ref;
        if (!funcDef|| !isDefinition(funcDef)){ 
            return undefined;
        }
        //Handles infinite recursion
        if (funcDef.expr === node) {
        return undefined;
    }
        return typir.Inference.inferType(funcDef.expr);
    }

    if (isIfStatement(node)) {
        // If statements don't produce a value — only their condition type matters
        return undefined;
    }

    return numberType;
});