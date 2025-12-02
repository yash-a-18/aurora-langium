import type { AstNode, LangiumDocument, ReferenceDescription } from 'langium';
import { EmptyFileSystem } from 'langium';
import { clearDocuments, parseDocument } from 'langium/test';
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

const brokenReferenceText = [
    'Issues:',
    'IC1 : ic1 from Thunder_Bay_Regional_CHF'
].join('\n');

describe('Aurora cross references', () => {
    test('find references to module across documents', async () => {
        const docs = await buildAuroraWorkspace([
            { uri: 'file:///module.aurora', content: moduleText },
            { uri: 'file:///referencing.aurora', content: referencingText }
        ]);

        const moduleDoc = docs.get('file:///module.aurora')!;
        const referencingDoc = docs.get('file:///referencing.aurora')!;

        expect(moduleDoc.diagnostics ?? []).toHaveLength(0);
        expect(referencingDoc.diagnostics ?? []).toHaveLength(0);

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

    test('flags unresolved reference when target module is missing', async () => {
        const docs = await buildAuroraWorkspace([
            { uri: 'file:///broken-reference.aurora', content: brokenReferenceText }
        ]);

        const referencingDoc = docs.get('file:///broken-reference.aurora')!;

        const referencingDiagnostics = referencingDoc.diagnostics ?? [];
        expect(referencingDiagnostics.length).toBeGreaterThan(0);

        const brokenPCM = referencingDoc.parseResult.value as PCM;
        const issues = brokenPCM.elements.find(element => element.$type === 'Issues') as Issues;
        const coord = issues.coord[0] as IssueCoordinate;
        expect(coord.mods).toHaveLength(1);
        expect(coord.mods[0].ref).toBeUndefined();
        expect(coord.mods[0].error).toBeDefined();
    });
});

async function parseAuroraDocument(content: string, uri: string): Promise<LangiumDocument<PCM>> {
    return parseDocument<PCM>(services, content, { documentUri: uri });
}

type WorkspaceInput = Array<{ uri: string; content: string }>;

async function buildAuroraWorkspace(entries: WorkspaceInput): Promise<Map<string, LangiumDocument<PCM>>> {
    await clearDocuments(services);
    const documents = await Promise.all(entries.map(entry => parseAuroraDocument(entry.content, entry.uri)));
    await services.shared.workspace.DocumentBuilder.build(documents, { validation: true });
    return entries.reduce((acc, entry, index) => acc.set(entry.uri, documents[index]), new Map<string, LangiumDocument<PCM>>());
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
