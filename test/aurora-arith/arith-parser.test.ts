import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Arith_Module, BinaryExpression, Evaluation, PCM, isBinaryExpression, isNumberLiteral } from '../../src/language/generated/ast.js';
import { interpretEvaluations } from '../../src/language/aurora-arith-evaluator.js';
import { parse } from '../../src/cli/index.js';

const __dirname = path.relative(process.cwd(), path.dirname(__filename));

interface TestCase {
    expression: string;
    computed: number;
    expected: number;
}

function calculateExpected(left: number, operator: string, right: number): number {
    switch (operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '^': return Math.pow(left, right);
        case '%': return left % right;
        default: throw new Error(`Unknown operator: ${operator}`);
    }
}

test('ArithParserTest: binaryexpressions file works', async () => {
    const filePath = path.resolve(__dirname, 'resources', 'math1.aurora');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const module = await parse(filePath) as PCM;
    const arithModule = module.elements.find(el => el.$type === 'Arith_Module') as Arith_Module | undefined;
    expect(arithModule).toBeDefined();
    expect(arithModule?.name).toBe('binaryexpressions');

    const results = interpretEvaluations(module);
    expect(results.size).toBe(6);

    const testCases: TestCase[] = [];
    let processedCount = 0;

    results.forEach((computedValue, evaluation: Evaluation) => {
        const expr = evaluation.expression;
        const source = fileContent.split('\n')[processedCount + 1]?.trim().replace(';', '') ?? '';

        const candidate = expr as BinaryExpression | typeof expr;
        if (isBinaryExpression(candidate)) {
            const leftExpr = candidate.left;
            const rightExpr = candidate.right;
            if (isNumberLiteral(leftExpr) && isNumberLiteral(rightExpr)) {
                const expected = calculateExpected(leftExpr.value, candidate.operator, rightExpr.value);
                testCases.push({
                    expression: source,
                    computed: Number(computedValue),
                    expected
                });
                processedCount++;
            }
        }
    });

    expect(processedCount).toBe(6);

    testCases.forEach(({ expression, computed, expected }) => {
        expect(computed, `Mismatch in expression: ${expression}`).toBe(expected);
    });
});
