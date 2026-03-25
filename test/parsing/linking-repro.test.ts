import { expect, test } from 'vitest';
import path from 'node:path';
import { parse } from '../../src/cli/index.js';

test('CLI parse resolves cross-file module references from sibling aurora files', async () => {
    const filePath = path.resolve(process.cwd(), 'Examples/Test3.aurora');
    await expect(parse(filePath)).resolves.toBeDefined();
});
