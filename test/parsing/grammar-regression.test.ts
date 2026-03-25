import { describe, expect, test } from 'vitest';
import { EmptyFileSystem, URI } from 'langium';
import { createAuroraServices } from '../../src/language/aurora-module.js';
import type { ClinicalValue, NamedGroupClinical, NamedGroupOrder, PCM } from '../../src/language/generated/ast.js';

async function buildModel(model: string) {
    const services = createAuroraServices(EmptyFileSystem).Aurora;
    const uri = URI.parse(`memory:///grammar-${Math.random().toString(16).slice(2)}.aurora`);
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(model, uri);
    services.shared.workspace.LangiumDocuments.addDocument(document);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });
    return document;
}

describe('Grammar regressions', () => {
    test('keeps named group timestamps while preserving clinical node types', async () => {
        const document = await buildModel(`
Clinical:
NGC1: @10:30
CC1
@2023/11/16 10:30 CC2 - 'Nar1'
age [??? yrs]
`);

        expect(document.parseResult.parserErrors).toHaveLength(0);

        const pcm = document.parseResult.value as PCM;
        const group = (pcm.elements[0] as { namedGroups: NamedGroupClinical[] }).namedGroups[0];

        expect(group.timestamp?.time).toBe('10:30');
        expect(group.coord[0].$type).toBe('ClinicalCoordinate');
        expect(group.coord[0].timestamp).toBeUndefined();
        expect(group.coord[1].$type).toBe('ClinicalCoordinate');
        expect(group.coord[1].timestamp?.date).toBe('2023/11/16');
        expect(group.coord[1].timestamp?.time).toBe('10:30');
        expect(group.coord[2].$type).toBe('ClinicalValue');
        expect((group.coord[2] as ClinicalValue).values[0]?.value).toBe('???');
    });

    test('distinguishes single orders from mutually exclusive orders', async () => {
        const document = await buildModel(`
Orders:
Medications:
tylenol
advil or motrin
`);

        expect(document.parseResult.parserErrors).toHaveLength(0);

        const pcm = document.parseResult.value as PCM;
        const group = (pcm.elements[0] as { namedGroups: NamedGroupOrder[] }).namedGroups[0];

        expect(group.orders[0]?.$type).toBe('OrderCoordinate');
        expect(group.orders[1]?.$type).toBe('MutuallyExclusive');
    });
});
