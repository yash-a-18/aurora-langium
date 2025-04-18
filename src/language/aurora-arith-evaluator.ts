import type { AbstractDefinition, Arith_Module, Definition, Evaluation, Expression, PCM, Statement } from './generated/ast.js';
import { isBinaryExpression, isDefinition, isEvaluation, isFunctionCall, isNumberLiteral } from './generated/ast.js';
import { applyOp } from './aurora-arith-utils.js';

export function interpretEvaluations(module: PCM): Map<Evaluation, number> {
    const ctx = <InterpreterContext>{
        module,
        context: new Map<string, number | Definition>(),
        result: new Map<Evaluation, number>()
    };
    return evaluate(ctx);
}

export interface InterpreterContext {
    module: PCM,
    // variable name --> value
    context: Map<string, number | Definition>,
    // expression --> value
    result: Map<Evaluation, number>
}

function evaluate(ctx: InterpreterContext): Map<Evaluation, number> {
    // Find Arith_Module inside ctx.module
    const arithModule = ctx.module.elements.find(el => el.$type === "Arith_Module") as Arith_Module;
    arithModule.statements.forEach(stmt => evalStatement(ctx, stmt));
    // ctx.module.elements.forEach(stmt => evalStatement(ctx, stmt));
    return ctx.result;
}

function evalStatement(ctx: InterpreterContext, stmt: Statement): void {
    if (isDefinition(stmt)) {
        evalDefinition(ctx, stmt);
    } else if (isEvaluation(stmt)) {
        evalEvaluation(ctx, stmt);
    } else {
        console.error('Impossible type of Statement.');
    }
}

function evalDefinition(ctx: InterpreterContext, def: Definition): void {
    ctx.context.set(def.name, def.args.length > 0 ? def : evalExpression(def.expr, ctx));
}

function evalEvaluation(ctx: InterpreterContext, evaluation: Evaluation): void {
    ctx.result.set(evaluation, evalExpression(evaluation.expression, ctx));
}

export function evalExpression(expr: Expression, ctx?: InterpreterContext): number {
    if(ctx === undefined) {
        ctx = <InterpreterContext>{
            module: expr.$document?.parseResult.value,
            context: new Map<string, number | Definition>(),
            result: new Map<Evaluation, number>()
        };
    }
    if (isBinaryExpression(expr)) {
        const left = evalExpression(expr.left, ctx);
        const right = evalExpression(expr.right, ctx);
        if (right === undefined) return left;
        return applyOp(expr.operator)(left, right);
    }
    if (isNumberLiteral(expr)) {
        return +expr.value;
    }
    if (isFunctionCall(expr)) {
        const valueOrDef = ctx.context.get((expr.func.ref as AbstractDefinition).name) as number | Definition;
        if (!isDefinition(valueOrDef)) {
            return valueOrDef;
        }
        if (valueOrDef.args.length !== expr.args.length) {
            throw new Error('Function definition and its call have different number of arguments: ' + valueOrDef.name);
        }

        const localContext = new Map<string, number | Definition>(ctx.context);
        for (let i = 0; i < valueOrDef.args.length; i += 1) {
            localContext.set(valueOrDef.args[i].name, evalExpression(expr.args[i], ctx));
        }
        return evalExpression(valueOrDef.expr, {module: ctx.module, context: localContext, result: ctx.result});
    }

    throw new Error('Impossible type of Expression.');
}