import type {
    Arith_Module,
    BinaryExpression,
    Definition,
    Evaluation,
    Expression,
    IfStatement,
    PCM,
    Statement
} from './generated/ast.js';
import {
    isArith_Module,
    isBinaryExpression,
    isBooleanLiteral,
    isDeclaredParameter,
    isDefinition,
    isEvaluation,
    isFunctionCall,
    isIfStatement,
    isNumberLiteral,
    isPCM
} from './generated/ast.js';

export type RuntimeValue = number | boolean;

export type EvalContext = {
    symbols: Map<string, RuntimeValue | Definition>
    stdout: string[]
}

export function evalStatement(statement: Statement, ctx: EvalContext): void {
    evalSingleStatement(statement, ctx, new Map<Evaluation, RuntimeValue>());
}

function evalSingleStatement(statement: Statement, ctx: EvalContext, results: Map<Evaluation, RuntimeValue>): void {
    if (isDefinition(statement)) {
        evalDefinition(statement, ctx);
        return;
    }

    if (isEvaluation(statement)) {
        const value = evalExpression(statement.expression, ctx);
        ctx.stdout.push(String(value));
        results.set(statement, value);
        return;
    }

    if (isIfStatement(statement)) {
        evalIfStatement(statement, ctx, results);
        return;
    }

    throw new Error('Impossible statement case.');
}

function evalDefinition(definition: Definition, ctx: EvalContext): void {
    const definitionName = normalizeDefinitionName(definition.name);
    if (definition.args.length > 0) {
        ctx.symbols.set(definitionName, definition);
        return;
    }
    const value = evalExpression(definition.expr, ctx);
    ctx.symbols.set(definitionName, value);
}

function evalIfStatement(statement: IfStatement, ctx: EvalContext, results: Map<Evaluation, RuntimeValue>): void {
    const conditionValue = evalExpression(statement.condition, ctx);
    if (Boolean(conditionValue)) {
        evalStatements(statement.thenBlock.statements, ctx, results);
        return;
    }

    if (statement.elseIf) {
        evalIfStatement(statement.elseIf, ctx, results);
        return;
    }

    if (statement.elseBlock) {
        evalStatements(statement.elseBlock.statements, ctx, results);
    }
}

function evalStatements(statements: Iterable<Statement>, ctx: EvalContext, results: Map<Evaluation, RuntimeValue>): void {
    for (const statement of statements) {
        evalSingleStatement(statement, ctx, results);
    }
}

export function evalExpression(expr: Expression | BinaryExpression, ctx: EvalContext): RuntimeValue {
    if (isNumberLiteral(expr)) {
        return expr.value;
    }

    if (isBooleanLiteral(expr)) {
        return expr.value === 'true';
    }

    if (isBinaryExpression(expr)) {
        const left = evalExpression(expr.left, ctx);
        const right = evalExpression(expr.right, ctx);
        return applyOp(expr.operator)(left, right);
    }

    if (isFunctionCall(expr)) {
        return evalFunctionCall(expr, ctx);
    }

    throw new Error('Invalid expression type.');
}

function evalFunctionCall(expr: Extract<Expression, { $type: 'FunctionCall' }>, ctx: EvalContext): RuntimeValue {
    const target = expr.func.ref;

    if (target && isDeclaredParameter(target)) {
        const value = ctx.symbols.get(target.name);
        if (value === undefined || isDefinition(value)) {
            throw new Error(`Unknown parameter: ${target.name}`);
        }
        return value;
    }

    const def = target && isDefinition(target) ? target : undefined;
    if (def) {
        return invokeDefinition(def, expr.args, ctx);
    }

    const name = expr.func.$refText;
    if (!name) {
        throw new Error('Unable to resolve function call target.');
    }

    const resolved = ctx.symbols.get(name);
    if (resolved === undefined) {
        throw new Error(`Unknown symbol: ${name}`);
    }

    if (isDefinition(resolved)) {
        return invokeDefinition(resolved, expr.args, ctx);
    }

    if (expr.args.length > 0) {
        throw new Error(`Symbol '${name}' is not callable.`);
    }

    return resolved;
}

function invokeDefinition(definition: Definition, callArgs: Expression[], ctx: EvalContext): RuntimeValue {
    if (definition.args.length !== callArgs.length) {
        throw new Error(
            `Function definition and its call have different number of arguments: ${normalizeDefinitionName(definition.name)}`
        );
    }

    if (definition.args.length === 0) {
        return evalExpression(definition.expr, ctx);
    }

    const localSymbols = new Map(ctx.symbols);
    for (let i = 0; i < definition.args.length; i += 1) {
        localSymbols.set(definition.args[i].name, evalExpression(callArgs[i], ctx));
    }

    return evalExpression(definition.expr, {
        ...ctx,
        symbols: localSymbols
    });
}

function applyOp(op: BinaryExpression['operator']): (a: RuntimeValue, b: RuntimeValue) => RuntimeValue {
    switch (op) {
        case '+': return (a, b) => +a + +b;
        case '-': return (a, b) => +a - +b;
        case '*': return (a, b) => +a * +b;
        case '/': return (a, b) => +a / +b;
        case '%': return (a, b) => +a % +b;
        case '^': return (a, b) => Math.pow(+a, +b);
        case '==': return (a, b) => a === b;
        case '!=': return (a, b) => a !== b;
        case '<': return (a, b) => +a < +b;
        case '>': return (a, b) => +a > +b;
        case '<=': return (a, b) => +a <= +b;
        case '>=': return (a, b) => +a >= +b;
        default: throw new Error(`Unknown operator: ${op}`);
    }
}

export function interpretEvaluations(model: PCM | Arith_Module): Map<Evaluation, RuntimeValue> {
    const context: EvalContext = {
        symbols: new Map(),
        stdout: []
    };
    const results = new Map<Evaluation, RuntimeValue>();

    if (isArith_Module(model)) {
        evalStatements(model.statements, context, results);
        return results;
    }

    if (isPCM(model)) {
        for (const element of model.elements) {
            if (isArith_Module(element)) {
                evalStatements(element.statements, context, results);
            } else if (isEvaluation(element)) {
                const value = evalExpression(element.expression, context);
                context.stdout.push(String(value));
                results.set(element, value);
            }
        }
    }

    return results;
}

function normalizeDefinitionName(name: string): string {
    return name.endsWith(':') ? name.slice(0, -1) : name;
}
