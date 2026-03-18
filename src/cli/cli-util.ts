import type { AstNode, LangiumCoreServices, LangiumDocument } from 'langium';
import type { Diagnostic } from 'vscode-languageserver-types';
import chalk from 'chalk';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { URI } from 'langium';

export class DocumentValidationError extends Error {
    constructor(
        message: string,
        public readonly document: LangiumDocument,
        public readonly diagnostics: Diagnostic[]
    ) {
        super(message);
    }
}

export async function extractDocument(fileName: string, services: LangiumCoreServices): Promise<LangiumDocument> {
    const extensions = services.LanguageMetaData.fileExtensions;
    if (!extensions.includes(path.extname(fileName))) {
        console.error(chalk.yellow(`Please choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(chalk.red(`File ${fileName} does not exist.`));
        process.exit(1);
    }

    // --- NEW LOGIC: Load all files in the directory for linking ---
    const absolutePath = path.resolve(fileName);
    const targetDir = path.dirname(absolutePath);

    const allFilesInDir = fs.readdirSync(targetDir);
    const languageFiles = allFilesInDir
        .filter(file => extensions.includes(path.extname(file)))
        .map(file => path.join(targetDir, file));

    const documents = await Promise.all(
        languageFiles.map(file => services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(file)))
    );

    await services.shared.workspace.DocumentBuilder.build(documents, { validation: true });

    // Retrieve the specific document requested
    const targetUri = URI.file(absolutePath);
    const document = services.shared.workspace.LangiumDocuments.getDocument(targetUri);

    if (!document) {
        console.error(chalk.red(`Failed to retrieve document for ${fileName}.`));
        process.exit(1);
    }
    // --------------------------------------------------------------

    const validationErrors = (document.diagnostics ?? []).filter(e => e.severity === 1);
    if (validationErrors.length > 0) {
        const errorLines = validationErrors.map(validationError =>
            `line ${validationError.range.start.line + 1}: ${validationError.message} ` +
            `[${document.textDocument.getText(validationError.range)}]`
        );
        const message = ['There are validation errors:', ...errorLines].join('\n');
        throw new DocumentValidationError(message, document, validationErrors);
    }

    return document;
}

export async function extractAstNode<T extends AstNode>(fileName: string, services: LangiumCoreServices): Promise<T> {
    return (await extractDocument(fileName, services)).parseResult?.value as T;
}

interface FilePathData {
    destination: string,
    name: string
}

export function extractDestinationAndName(filePath: string, destination: string | undefined): FilePathData {
    filePath = path.basename(filePath, path.extname(filePath)).replace(/[.-]/g, '');
    return {
        destination: destination ?? path.join(path.dirname(filePath), 'generated'),
        name: path.basename(filePath)
    };
}