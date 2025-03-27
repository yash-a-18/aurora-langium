import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PCM, Arith_Module } from '../../src/language/generated/ast.js';
import { interpretEvaluations } from '../../src/language/aurora-arith-evaluator.js';
import { parse } from '../../src/cli/cli-util.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestCase {
    expression: string;
    computed: number;
    expected: number;
}

test('ArithParserTest: binaryexpressions file works', async () => {
    try {
        const filePath = path.resolve(__dirname, 'resources', 'math1.aurora');
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const module = await parse(filePath) as PCM;
        const arithModule = module.elements.find(el => el.$type === "Arith_Module") as Arith_Module
        expect(arithModule.name).toBe('binaryexpressions');

        const results = interpretEvaluations(module);
        expect(results.size).toBe(6);

        const testCases: TestCase[] = [];
        let processedCount = 0;

        results.forEach((computedValue, evaluation) => {
            const expr = evaluation.expression;
            const source = fileContent.split('\n')[processedCount + 1].trim().replace(';', '');

            if (expr.$type === 'BinaryExpression') {
                const left = (expr.left as any).value;
                const right = (expr.right as any).value;
                const operator = expr.operator;

                const expected = calculateExpected(left, operator, right);

                testCases.push({
                    expression: source,
                    computed: Number(computedValue),
                    expected: Number(expected)
                });

                processedCount++;
            }
        });

        expect(processedCount).toBe(6);

        testCases.forEach(({ expression, computed, expected }) => {
            console.log(`Testing: ${expression} → Computed: ${computed}, Expected: ${expected}`);
            expect(computed, `Mismatch in expression: ${expression}`).toBe(expected);
        });

    } catch (e) {
        console.error('Test failed:', e);
        throw e;
    }
});

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