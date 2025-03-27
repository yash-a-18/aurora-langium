import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PCM, Arith_Module } from '../../src/language/generated/ast.js';
import { interpretEvaluations } from '../../src/language/aurora-arith-evaluator.js';
import { parse } from '../../src/cli/cli-util.js';

const __dirname = path.relative(process.cwd(), path.dirname(__filename)); // Relative to the current working directory

interface TestCase {
    expression: string;
    computed: number;
    expected: number;
}

test('ArithParserTernaryTest: ternaryexpressions file works', async () => {
    try {
        const filePath = path.resolve(__dirname, 'resources', 'math2.aurora');
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const module = await parse(filePath) as PCM;
        const arithModule = module.elements.find(el => el.$type === "Arith_Module") as Arith_Module
        expect(arithModule.name).toBe('ternaryexpressions');

        const results = interpretEvaluations(module);
        const lines = fileContent.split('{')
            .map(line => line.trim())
            .filter(line => (line.length > 0 && !line.startsWith('arith_module') ));
        const eval_lines = lines.reverse()[0].split('}')[0].split(';').map(line => line.trim()).filter(line => line.length > 0);

        expect(results.size).toBe(eval_lines.length);

        const testCases: TestCase[] = [];
        let index = 0;

        results.forEach((computedValue, evaluation) => {
            const originalExpression = eval_lines[index];
            const computed = Number(computedValue);
            const expected = safeEvaluate(originalExpression);

            testCases.push({
                expression: originalExpression,
                computed,
                expected
            });

            index++;
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

function safeEvaluate(expression: string): number {

    const jsExpression = expression
        .replace(/\^/g, '**')
        .replace(/%/g, '%')
        .replace(/\//g, '/')
        .replace(/\*/g, '*');

    try {

        return Function(`"use strict"; return (${jsExpression})`)();
    } catch (error) {
        throw new Error(`Failed to evaluate expression: ${expression} - ${error}`);
    }
}