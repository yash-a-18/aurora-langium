import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PCM, Arith_Module, Evaluation } from '../../src/language/generated/ast.js';
import { interpretEvaluations } from '../../src/language/aurora-arith-evaluator.js';
import { parse } from '../../src/cli/cli-util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestCase {
    expression: string;
    computed: number;
    expected: number;
}

test('ArithParserMultiTest: multiexpressions file works', async () => {
    try {
        const filePath = path.resolve(__dirname, 'resources', 'math3.aurora');
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const module = await parse(filePath) as PCM;
        const arithModule = module.elements.find(el => el.$type === "Arith_Module") as Arith_Module
        expect(arithModule.name).toBe('multiexpressions');

        const results = interpretEvaluations(module);
        const evaluations = arithModule.statements.filter(s => s.$type === 'Evaluation');
        expect(results.size).toBe(evaluations.length);

        const testCases: TestCase[] = [];

        results.forEach((computedValue, evaluation: Evaluation) => {
            const exprText = extractExpressionText(
                fileContent,
                evaluation.expression.$cstNode?.offset || 0,
                evaluation.expression.$cstNode?.length || 0
            );
            const expected = safeEvaluate(exprText);
            testCases.push({
                expression: exprText,
                computed: Number(computedValue),
                expected: Number(expected)
            });
        });
        testCases.forEach(({ expression, computed, expected }) => {
            console.log(`Testing: ${expression} → Computed: ${computed}, Expected: ${expected}`);
            expect(computed, `Mismatch in expression: ${expression}`).toBe(expected);
        });

    } catch (e) {
        console.error('Test failed:', e);
        throw e;
    }
});

function extractExpressionText(content: string, offset: number, length: number): string {
    return content.slice(offset, offset + length).trim();
}

function safeEvaluate(expression: string): number {
    const jsExpression = expression
        .replace(/\^/g, '**')
        .replace(/;/g, '');

    try {
        return Function(`"use strict"; return (${jsExpression})`)();
    } catch (error) {
        throw new Error(`Evaluation failed for: ${expression} - ${error}`);
    }
}