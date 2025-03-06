import { describe, expect, test } from "vitest";
import { parseFromText } from "../../src/extension/src/parser/parser.js";
import { createAuroraServices } from "../../src/language/aurora-module.js";
import { EmptyFileSystem } from "langium";



describe('Parsing tests', () => {

    test('parse simple model', async () => {
        const model = `
            Issues:
            A
            B
            Orders:
            ngo:
            C
            D
        `;

        const services = createAuroraServices(EmptyFileSystem).Aurora
        const pcm = await parseFromText(services, model)
        expect(pcm.module).toBeUndefined

        const issues = pcm.elements.filter(i => i.$type === "Issues");
        expect(issues.length).toBeGreaterThan(0);
        expect(issues.flatMap(i => (i as any).coord).map(ic => ic.name)[0]).toBe('A');
    });
});

