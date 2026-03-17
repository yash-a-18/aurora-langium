import { describe, expect, test } from 'vitest';
import { EmptyFileSystem, URI } from 'langium';
import { createAuroraServices } from '../../src/language/aurora-module.js';
import { isOrderCoordinate } from '../../src/language/generated/ast.js';
import type { Orders, PCM } from '../../src/language/generated/ast.js';
import path from 'node:path';
import { NodeFileSystem } from 'langium/node';

function unresolvedReferenceDiagnostics(diagnostics: readonly { severity?: number; message: string }[]) {
    return diagnostics.filter(d =>
        d.severity === 1 && /resolve reference|unresolved|cannot be resolved/i.test(d.message)
    );
}

describe('Linking regression repro', () => {
    test('local QuReference resolves Order->Issue coordinate', async () => {
        const model = `
Issues:
IC1

Orders:
NGO:
OC1(IC1)
`;

        const services = createAuroraServices(EmptyFileSystem).Aurora;
        const uri = URI.parse('memory:///linking-repro.aurora');
        const document = services.shared.workspace.LangiumDocumentFactory.fromString(model, uri);
        services.shared.workspace.LangiumDocuments.addDocument(document);

        await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

        const linkingErrors = unresolvedReferenceDiagnostics(document.diagnostics ?? []);
        expect(linkingErrors).toHaveLength(0);

        const root = document.parseResult.value as PCM;
        const orders = root.elements.filter((element): element is Orders => element.$type === 'Orders');
        const oc = orders
            .flatMap(group => group.namedGroups)
            .flatMap(group => group.orders)
            .find(isOrderCoordinate);

        expect(oc).toBeDefined();
        expect(oc?.qurc?.quRefs[0]?.ref?.$refText).toBe('IC1');
        expect(oc?.qurc?.quRefs[0]?.ref?.ref?.$type).toBe('IssueCoordinate');
        expect(oc?.qurc?.quRefs[0]?.ref?.ref?.name).toBe('IC1');
    });

    test('cross-file module refs resolve when referenced files are in workspace', async () => {
        const services = createAuroraServices(NodeFileSystem).Aurora;
        const files = [
            'Examples/Test3.aurora',
            'Examples/chf_drkim.aurora',
            'Examples/MI_DrKim_2024.aurora'
        ].map(file => path.resolve(process.cwd(), file));

        const docs = await Promise.all(
            files.map(file => services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(file)))
        );

        await services.shared.workspace.DocumentBuilder.build(docs, { validation: true });

        const test3Doc = docs.find(doc => doc.uri.fsPath.endsWith(path.join('Examples', 'Test3.aurora')));
        expect(test3Doc).toBeDefined();

        const linkingErrors = unresolvedReferenceDiagnostics(test3Doc?.diagnostics ?? []);
        expect(linkingErrors).toHaveLength(0);
    });
});
