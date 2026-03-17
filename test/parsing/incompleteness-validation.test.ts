import { describe, expect, test } from 'vitest';
import { EmptyFileSystem, URI } from 'langium';
import { createAuroraServices } from '../../src/language/aurora-module.js';

async function validate(model: string) {
    const services = createAuroraServices(EmptyFileSystem).Aurora;
    const uri = URI.parse(`memory:///incompleteness-${Math.random().toString(16).slice(2)}.aurora`);
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(model, uri);
    services.shared.workspace.LangiumDocuments.addDocument(document);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });
    return document.diagnostics ?? [];
}

describe('Incompleteness validation', () => {
    test('accepts incomplete values and reports a warning', async () => {
        const diagnostics = await validate(`
Clinical:
EDreferral:
age [??? yrs]
`);

        expect(diagnostics.filter(diagnostic => diagnostic.severity === 1)).toHaveLength(0);
        const warnings = diagnostics.filter(diagnostic => diagnostic.severity === 2);
        expect(warnings.map(warning => warning.message)).toContain('Value is marked as incomplete.');
    });

    test('accepts incomplete units and reports a warning', async () => {
        const diagnostics = await validate(`
Clinical:
EDreferral:
age [5 ???]
`);

        expect(diagnostics.filter(diagnostic => diagnostic.severity === 1)).toHaveLength(0);
        const warnings = diagnostics.filter(diagnostic => diagnostic.severity === 2);
        expect(warnings.map(warning => warning.message)).toContain('Unit is marked as incomplete.');
    });
});
