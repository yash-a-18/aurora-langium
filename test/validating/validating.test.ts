import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import type { Diagnostic } from "vscode-languageserver-types";
import { createAuroraServices } from "../../src/language/aurora-module.js";

let services: ReturnType<typeof createAuroraServices>;
let parse:    ReturnType<typeof parseHelper<any>>;
let document: LangiumDocument<any> | undefined;

beforeAll(async () => {
    services = createAuroraServices(EmptyFileSystem);
    const doParse = parseHelper<any>(services.Aurora);
    parse = (input: string) => doParse(input, { validation: true });

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Validating', () => {
  
    test('check no errors', async () => {
        document = await parse(`
            person Langium
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the diagnostics by converting them into human readable strings;
            // note that 'toHaveLength()' works for arrays and strings alike ;-)
            checkDocumentValid(document) || document?.diagnostics?.map(diagnosticToString)?.join('\n')
        ).toHaveLength(0);
    });

    test('check capital letter validation', async () => {
        document = await parse(`
            person langium
        `);

        expect(
            checkDocumentValid(document) || document?.diagnostics?.map(diagnosticToString)?.join('\n')
        ).toEqual(
            // 'expect.stringContaining()' makes our test robust against future additions of further validation rules
            expect.stringContaining(s`
                [1:19..1:26]: Person name should start with a capital.
            `)
        );
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || undefined;
}

function diagnosticToString(d: Diagnostic) {
    return `[${d.range.start.line}:${d.range.start.character}..${d.range.end.line}:${d.range.end.character}]: ${d.message}`;
}
