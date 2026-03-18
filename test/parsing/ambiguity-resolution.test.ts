import { describe, test, expect } from 'vitest';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createAuroraServices } from '../../src/language/aurora-module.js';
import type { PCM } from '../../src/language/generated/ast.js';

const services = createAuroraServices(EmptyFileSystem).Aurora;
const parse = parseHelper<PCM>(services);

describe('Aurora Parser Ambiguity Resolution', () => {

    test('Successfully parses both bare coordinates and bracketed values as ClinicalItems', async () => {
        const input = `
            Clinical:
            EDreferral:
            HPI -- patient presents 2 hour history of increasing dyspnea;
            age [??? yrs]
        `;
        
        const document = await parse(input);
        
        // Ensure no parser errors occurred
        expect(document.parseResult.parserErrors).toHaveLength(0);
        
        const pcm = document.parseResult.value;
        const clinicalBlock = pcm.elements[0] as any;
        const namedGroup = clinicalBlock.namedGroups[0];
        
        // Assert that 'HPI' was parsed as a ClinicalItem (without values)
        expect(namedGroup.coord[0].$type).toBe('ClinicalItem');
        expect(namedGroup.coord[0].name).toBe('HPI');
        expect(namedGroup.coord[0].values).toHaveLength(0); // Or empty array depending on Langium config
        
        // Assert that 'age' was parsed as a ClinicalItem (with values due to the '[' bracket)
        expect(namedGroup.coord[1].$type).toBe('ClinicalItem');
        expect(namedGroup.coord[1].name).toBe('age');
        expect(namedGroup.coord[1].values[0].value).toBe('???');
    });

    test('Successfully differentiates OrderCoordinate and MutuallyExclusive orders', async () => {
        const input = `
            Orders:
            Medications:
            tylenol
            advil or motrin
        `;
        
        const document = await parse(input);
        
        expect(document.parseResult.parserErrors).toHaveLength(0);
        
        const pcm = document.parseResult.value;
        const ordersBlock = pcm.elements[0] as any;
        const namedGroup = ordersBlock.namedGroups[0];
        
        // 'tylenol' should be a single OrderCoordinate
        expect(namedGroup.orders[0].$type).toBe('OrderCoordinate');
        expect(namedGroup.orders[0].name).toBe('tylenol');
        
        // 'advil or motrin' should be captured as a MutuallyExclusive block
        expect(namedGroup.orders[1].$type).toBe('MutuallyExclusive');
        expect(namedGroup.orders[1].order1.name).toBe('advil');
        expect(namedGroup.orders[1].order2.name).toBe('motrin');
    });

});