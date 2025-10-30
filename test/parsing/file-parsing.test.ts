import { describe, expect, test } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { URI } from 'vscode-uri';
import { NodeFileSystem } from 'langium/node';

import { createAuroraServices } from '../../src/language/aurora-module.js';
import { parseFromText } from '../../src/extension/src/parser/parser.js';

const __dirname = path.relative(process.cwd(), path.dirname(__filename));
const fixturePath = path.resolve(__dirname, 'fixtures', 'simple-valid.aurora');

describe('File-based parsing', () => {
    test('parses a PCM from disk', async () => {
        const model = await fs.readFile(fixturePath, 'utf-8');

        const services = createAuroraServices(NodeFileSystem).Aurora;
        const uri = URI.file(path.resolve(fixturePath));

        const pcm = await parseFromText(services, model, uri as any);

        expect(pcm.module).toBeUndefined();

        const issues = pcm.elements.filter(element => element.$type === 'Issues');
        expect(issues).toHaveLength(1);

        const issueNames = (issues[0] as any).coord.map((coord: any) => coord.name);
        expect(issueNames).toEqual(['A', 'B']);

        const orders = pcm.elements.find(element => element.$type === 'Orders');
        expect(orders).toBeDefined();

        const namedGroups = (orders as any).namedGroups ?? [];
        expect(namedGroups).toHaveLength(1);
        expect(namedGroups[0].name).toBe('GroupOne:');

        const orderNames = namedGroups[0].orders.map((order: any) => order.name);
        expect(orderNames).toEqual(['OrderA']);
    });
});
