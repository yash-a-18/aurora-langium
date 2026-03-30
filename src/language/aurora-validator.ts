import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { type AuroraAstType, type IssueCoordinate, type SingleValueUnit,type BinaryExpression, isDefinition } from './generated/ast.js';
import type { AuroraServices } from './aurora-module.js';
import { typir, numberType } from './arith-typir.js';
import type { FunctionCall } from './generated/ast.js';


/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AuroraServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AuroraValidator;
    const checks: ValidationChecks<AuroraAstType> = {
        // IssueCoordinate: validator.checkIssueCoordinateStartsWithCapital
        SingleValueUnit: validator.checkIncompleteness,
        BinaryExpression: validator.checkBinaryExpression,
        FunctionCall: validator.checkFunctionCall
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AuroraValidator {

    checkBinaryExpression(expr: BinaryExpression, accept: ValidationAcceptor): void {
        const leftType = typir.Inference.inferType(expr.left);
        const rightType = typir.Inference.inferType(expr.right);

        if (leftType !== numberType || rightType !== numberType) {
            accept('error', 'Binary operation requires numbers.', {
                node: expr
            });
        }
    }

    checkFunctionCall(call: FunctionCall, accept: ValidationAcceptor): void {

    const funcDef = call.func?.ref;

    if (!funcDef) {
        accept('error', 'Function is not defined.', { node: call });
        return;
    }

    if (!isDefinition(funcDef)) {
    accept('error', 'Referenced element is not a function.', { node: call });
    return;
}
    
    // get parameters
    const params = funcDef.args ?? [];

    // get arguments
    const args = call.args ?? [];

    // 1. Check argument count
    if (args.length !== params.length) {
        accept('error', 'Argument count does not match parameters.', { node: call });
        return;
    }

    // 2. Check each argument type
    for (let i = 0; i < args.length; i++) {

        const argType = typir.Inference.inferType(args[i]);
        const paramType = numberType;; // depends on how you model params

        if (argType !== paramType) {
            accept('error', `Argument ${i + 1} has incorrect type.`, {
                node: call
            });
        }
    }
}

    checkIncompleteness(svu: SingleValueUnit, accept: ValidationAcceptor): void {
        const incompletenessMarker = '???';

        // Check if the value is marked as incomplete
        if (svu.value === incompletenessMarker) {
            accept('warning', 'Value is marked as incomplete.', {
                node: svu,
                property: 'value'
            });
        }

        // Check if the unit is marked as incomplete
        if (svu.unit === incompletenessMarker) {
            accept('warning', 'Unit is marked as incomplete.', {
                node: svu,
                property: 'unit'
            });
        }
    }

    checkIssueCoordinateStartsWithCapital(issueCoordinate: IssueCoordinate, accept: ValidationAcceptor): void {
        if (issueCoordinate.name) {
            const firstChar = issueCoordinate.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'IssueCoordinate should start with a capital.', { node: issueCoordinate, property: 'name' });
            }
        }
    }

}
