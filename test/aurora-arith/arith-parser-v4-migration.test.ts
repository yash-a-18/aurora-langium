import { expect, test } from 'vitest';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from '../../src/cli/index.js';
import { interpretEvaluations } from '../../src/language/aurora-arith-evaluator.js';
import type { Arith_Module, PCM } from '../../src/language/generated/ast.js';

async function withTempAuroraFile<T>(
    fileName: string,
    contents: string,
    run: (filePath: string) => Promise<T>
): Promise<T> {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'aurora-arith-'));
    const filePath = path.join(tempDir, `${fileName}.aurora`);
    fs.writeFileSync(filePath, contents);

    try {
        return await run(filePath);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

test('ArithParserV4: supports definitions, calls and if/else statements', async () => {
    await withTempAuroraFile(
        'arith_v4_controlflow',
        `arith_module controlflow {\n    def add(a,b): a + b;\n    def threshold : 5;\n    if (add(2, 3) == threshold) {\n        add(8, 4);\n    } else {\n        0;\n    }\n    if (false) {\n        1;\n    } else {\n        2;\n    }\n}\n`,
        async filePath => {
            const module = await parse(filePath) as PCM;
            const arithModule = module.elements.find(el => el.$type === 'Arith_Module') as Arith_Module | undefined;
            expect(arithModule).toBeDefined();
            expect(arithModule?.name).toBe('controlflow');

            const results = interpretEvaluations(module);
            expect([...results.values()]).toEqual([12, 2]);
        }
    );
});

test('ArithParserV4: parses compact operator syntax without fallback', async () => {
    await withTempAuroraFile(
        'arith_v4_compact',
        `arith_module compact {\n    3*9+2;\n    5%2-1;\n}\n`,
        async filePath => {
            const module = await parse(filePath) as PCM;
            const results = interpretEvaluations(module);
            expect([...results.values()]).toEqual([29, 0]);
        }
    );
});
