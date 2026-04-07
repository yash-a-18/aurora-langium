import { expect, test, describe } from 'vitest';
import path from 'path';
import { PCM, Arith_Module, Evaluation, isEvaluation, isDefinition, isIfStatement, isFunctionCall, isBooleanLiteral, isBinaryExpression, type Definition, type IfStatement } from '../../src/language/generated/ast.js';
import { parse } from '../../src/cli/index.js';
import { typir, numberType, booleanType } from '../../src/language/arith-typir.js';

const __dirname = path.relative(process.cwd(), path.dirname(__filename));

// ---------------------------------------------------------------------------
// Helper: load and parse typir1.aurora once per test
// ---------------------------------------------------------------------------
async function loadTypirModule(): Promise<Arith_Module> {
    const filePath = path.resolve(__dirname, 'resources', 'typir1.aurora');
    const module = await parse(filePath) as PCM;
    const arithModule = module.elements.find(el => el.$type === 'Arith_Module') as Arith_Module | undefined;
    if (!arithModule) throw new Error('Arith_Module not found in typir1.aurora');
    return arithModule;
}

// ---------------------------------------------------------------------------
// Module sanity check
// ---------------------------------------------------------------------------
test('TypirTest: typir1.aurora parses correctly', async () => {
    const arithModule = await loadTypirModule();
    expect(arithModule).toBeDefined();
    expect(arithModule.name).toBe('typirtests');
});

// ---------------------------------------------------------------------------
// Function calls and parameters
// ---------------------------------------------------------------------------
describe('TypirTest: function calls and parameters', () => {

    test('function definitions are present', async () => {
        const arithModule = await loadTypirModule();
        const defs = arithModule.statements.filter(isDefinition) as Definition[];
        const names = defs.map(d => d.name);
        expect(names).toContain('add');
        expect(names).toContain('multiply');
    });

    test('each function definition has exactly 2 parameters', async () => {
        const arithModule = await loadTypirModule();
        const defs = arithModule.statements.filter(isDefinition) as Definition[];
        for (const def of defs) {
            expect(def.args.length, `${def.name} should have 2 params`).toBe(2);
        }
    });

    test('declared parameters infer to number', async () => {
        const arithModule = await loadTypirModule();
        const defs = arithModule.statements.filter(isDefinition) as Definition[];
        for (const def of defs) {
            for (const param of def.args) {
                expect(
                    typir.Inference.inferType(param),
                    `param '${param.name}' in '${def.name}' should be number`
                ).toBe(numberType);
            }
        }
    });

    test('function calls infer to number', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const calls = evaluations.filter(e => isFunctionCall(e.expression));
        expect(calls.length).toBeGreaterThanOrEqual(3);
        for (const call of calls) {
            expect(
                typir.Inference.inferType(call.expression),
                `call to '${(call.expression as any).func?.ref?.name}' should infer number`
            ).toBe(numberType);
        }
    });

    test('add(2, 3) infers to number', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const node = evaluations.find(e =>
            isFunctionCall(e.expression) && e.expression.func?.ref?.name === 'add'
        )?.expression;
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!)).toBe(numberType);
    });

    test('multiply(3, 4) infers to number', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const node = evaluations.find(e =>
            isFunctionCall(e.expression) && e.expression.func?.ref?.name === 'multiply'
        )?.expression;
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!)).toBe(numberType);
    });
});

// ---------------------------------------------------------------------------
// Booleans
// ---------------------------------------------------------------------------
describe('TypirTest: boolean literals', () => {

    test('true infers to boolean', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const node = evaluations.find(e =>
            isBooleanLiteral(e.expression) && e.expression.value === 'true'
        )?.expression;
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!)).toBe(booleanType);
    });

    test('false infers to boolean', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const node = evaluations.find(e =>
            isBooleanLiteral(e.expression) && e.expression.value === 'false'
        )?.expression;
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!)).toBe(booleanType);
    });

    test('boolean literal does NOT infer to number', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const node = evaluations.find(e => isBooleanLiteral(e.expression))?.expression;
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!)).not.toBe(numberType);
    });
});

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------
describe('TypirTest: comparison expressions', () => {

    const comparisonOps = ['==', '!=', '<', '>', '<=', '>='];

    for (const op of comparisonOps) {
        test(`comparison with ${op} infers to boolean`, async () => {
            const arithModule = await loadTypirModule();
            const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
            const node = evaluations.find(e =>
                isBinaryExpression(e.expression) && e.expression.operator === op
            )?.expression;
            expect(node, `No evaluation found with operator ${op}`).toBeDefined();
            expect(typir.Inference.inferType(node!)).toBe(booleanType);
        });
    }

    test('comparison result does NOT infer to number', async () => {
        const arithModule = await loadTypirModule();
        const evaluations = arithModule.statements.filter(isEvaluation) as Evaluation[];
        const node = evaluations.find(e =>
            isBinaryExpression(e.expression) && e.expression.operator === '=='
        )?.expression;
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!)).not.toBe(numberType);
    });
});

// ---------------------------------------------------------------------------
// Control flow
// ---------------------------------------------------------------------------
describe('TypirTest: control flow (if statements)', () => {

    test('if statements are present in the module', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        expect(ifStmts.length).toBeGreaterThanOrEqual(4);
    });

    test('if (true) condition infers to boolean', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        const node = ifStmts.find(s =>
            isBooleanLiteral(s.condition) && s.condition.value === 'true'
        );
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!.condition)).toBe(booleanType);
    });

    test('if (false) condition infers to boolean', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        const node = ifStmts.find(s =>
            isBooleanLiteral(s.condition) && s.condition.value === 'false'
        );
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!.condition)).toBe(booleanType);
    });

    test('if (1 == 1) condition infers to boolean', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        const node = ifStmts.find(s =>
            isBinaryExpression(s.condition) && s.condition.operator === '=='
        );
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!.condition)).toBe(booleanType);
    });

    test('if (2 < 5) condition infers to boolean', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        const node = ifStmts.find(s =>
            isBinaryExpression(s.condition) && s.condition.operator === '<'
        );
        expect(node).toBeDefined();
        expect(typir.Inference.inferType(node!.condition)).toBe(booleanType);
    });

    test('if/else structure is present', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        const node = ifStmts.find(s => s.elseBlock !== undefined);
        expect(node).toBeDefined();
        expect(node!.elseBlock).toBeDefined();
    });

    test('if/else if/else chain is present', async () => {
        const arithModule = await loadTypirModule();
        const ifStmts = arithModule.statements.filter(isIfStatement) as IfStatement[];
        const node = ifStmts.find(s => s.elseIf !== undefined);
        expect(node).toBeDefined();
        expect(node!.elseIf).toBeDefined();
    });
});