import { describe, expect, test } from 'vitest';
import { EmptyFileSystem, URI } from 'langium';
import { createAuroraServices } from '../../src/language/aurora-module.js';

async function validate(model: string) {
    const services = createAuroraServices(EmptyFileSystem).Aurora;
    const uri = URI.parse(`memory:///arith-validation-${Math.random().toString(16).slice(2)}.aurora`);
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(model, uri);
    services.shared.workspace.LangiumDocuments.addDocument(document);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });
    return document.diagnostics ?? [];
}

function errorMessages(diagnostics: readonly { severity?: number; message: string }[]) {
    return diagnostics
        .filter(diagnostic => diagnostic.severity === 1)
        .map(diagnostic => diagnostic.message);
}

describe('Arithmetic validation', () => {
    test('accepts boolean comparisons', async () => {
        const diagnostics = await validate(`
arith_module test {
    true == false;
}
`);

        expect(errorMessages(diagnostics)).toHaveLength(0);
    });

    test('rejects non-boolean if conditions', async () => {
        const diagnostics = await validate(`
arith_module test {
    if (1) {
        2;
    }
}
`);

        expect(errorMessages(diagnostics)).toContain('If condition must be a boolean.');
    });

    test('rejects arithmetic on boolean-returning functions', async () => {
        const diagnostics = await validate(`
arith_module test {
    def eq(a, b): a == b;
    1 + eq(1, 2);
}
`);

        expect(errorMessages(diagnostics)).toContain('Arithmetic operation requires numbers.');
    });

    test('accepts boolean-returning functions in if conditions', async () => {
        const diagnostics = await validate(`
arith_module test {
    def eq(a, b): a == b;
    if (eq(1, 2)) {
        0;
    }
}
`);

        expect(errorMessages(diagnostics)).toHaveLength(0);
    });
});
