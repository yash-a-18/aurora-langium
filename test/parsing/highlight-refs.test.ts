import { describe, test, expect } from 'vitest';
import type { LangiumDocument } from 'langium';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createAuroraServices } from '../../src/language/aurora-module.js';
import type { PCM, MODULE, Issues, IssueCoordinate } from '../../src/language/generated/ast.js';

const services = createAuroraServices(EmptyFileSystem).Aurora;

// Module that is being referenced
const moduleText = [
    'module: Thunder_Bay_Regional_CHF',
    '',
    'Issues:',
    '    ICBase : base'
].join('\n');

// Document that references the module
const referenceText = `
Clinical:
NGC1:
CC1 - 'Nar1'
Allergies
CC2 -! 'Nar2'
CV [2 a, 4 2] (CC1, CC2)  -? 'Nar3'
NGC2:
                                               
Issues:
    IC1 : ic1 from Thunder_Bay_Regional_CHF 
Orders:
NGO2:
    OC2(IC1)
`;

describe('Aurora cross references (complex case)', () => {

    test('should correctly resolve module reference inside Issues section', async () => {
        // Parse both documents
        const moduleDoc = await parseAuroraDocument(moduleText, 'file:///module.aurora');
        const referencingDoc = await parseAuroraDocument(referenceText, 'file:///referencing.aurora');

        // Build both documents (link references)
        await services.shared.workspace.DocumentBuilder.build([moduleDoc, referencingDoc]);

        // Extract the module node
        const modulePCM = moduleDoc.parseResult.value as PCM;
        expect(modulePCM.module).toBeDefined();
        const moduleNode = modulePCM.module as MODULE;

        // Extract 'Issues' from referencing document
        const referencingPCM = referencingDoc.parseResult.value as PCM;
        const issues = referencingPCM.elements.find(e => e.$type === 'Issues') as Issues;
        expect(issues).toBeDefined();

        // Get the first issue coordinate, which references the module
        const coord = issues.coord[0] as IssueCoordinate;
        expect(coord.mods).toHaveLength(1);
        expect(coord.mods[0].ref).toBeDefined();

        // Validate the reference points to the module name
        expect(coord.mods[0].ref?.name).toBe(moduleNode.name);

        // Optional: verify that IC2 (no external reference) is local
        // const localCoord = issues.coord[1] as IssueCoordinate;
        // expect(localCoord.mods?.length ?? 0).toBe(0);
    });

});

async function parseAuroraDocument(content: string, uri: string): Promise<LangiumDocument<PCM>> {
    return parseDocument<PCM>(services, content, { documentUri: uri });
}
