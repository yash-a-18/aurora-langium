import type { AstNode, LangiumDocument, ReferenceDescription } from 'langium';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { describe, expect, test } from 'vitest';

import { createAuroraServices } from '../../src/language/aurora-module.js';
import type { IssueCoordinate, Issues, MODULE, PCM } from '../../src/language/generated/ast.js';

const services = createAuroraServices(EmptyFileSystem).Aurora;

const moduleText = [
    'module: Thunder_Bay_Regional_CHF',
    '',
    'Issues:',
    'ICBase : base'
].join('\n');

const referencingText = [
    'Issues:',
    'IC1 : ic1 from Thunder_Bay_Regional_CHF'
].join('\n');

describe('Aurora cross references', () => {
    test('find references to module across documents', async () => {
        const moduleDoc = await parseAuroraDocument(moduleText, 'file:///module.aurora');
        const referencingDoc = await parseAuroraDocument(referencingText, 'file:///referencing.aurora');

        await services.shared.workspace.DocumentBuilder.build([referencingDoc, moduleDoc]);

        const modulePCM = moduleDoc.parseResult.value as PCM;
        expect(modulePCM.module).toBeDefined();
        const moduleNode = modulePCM.module as MODULE;

        const references = collectReferences(moduleNode);
        expect(references).toHaveLength(1);
        expect(references[0].sourceUri.toString()).toBe('file:///referencing.aurora');
        expect(rangeString(references[0])).toBe('1:15->1:39');

        const referencingPCM = referencingDoc.parseResult.value as PCM;
        const issues = referencingPCM.elements.find(element => element.$type === 'Issues') as Issues;
        const coord = issues.coord[0] as IssueCoordinate;
        expect(coord.mods).toHaveLength(1);
        expect(coord.mods[0].ref?.name).toBe(moduleNode.name);
    });
});

async function parseAuroraDocument(content: string, uri: string): Promise<LangiumDocument<PCM>> {
    return parseDocument<PCM>(services, content, { documentUri: uri });
}

function collectReferences(node: AstNode): ReferenceDescription[] {
    const refs: ReferenceDescription[] = [];
    services.shared.workspace.IndexManager.findAllReferences(node, nodePath(node)).forEach(ref => refs.push(ref));
    return refs;
}

function rangeString(ref: ReferenceDescription): string {
    const { start, end } = ref.segment.range;
    return `${start.line}:${start.character}->${end.line}:${end.character}`;
}

function nodePath(node: AstNode): string {
    return services.workspace.AstNodeLocator.getAstNodePath(node);
}
