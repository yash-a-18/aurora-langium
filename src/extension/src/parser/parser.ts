
import { PCM } from '../../../language/generated/ast.js'; 
import * as vscode from 'vscode';
import {URI} from 'vscode-uri'
import { AuroraServices } from '../../../language/aurora-module.js';


export async function parseFromText(services: AuroraServices, model: string, existingUri?:vscode.Uri): Promise<PCM> {
    const metaData = services.LanguageMetaData
    const randomNumber = Math.floor(Math.random() * 10000000) + 1000000;
    const uri = existingUri? existingUri :URI.parse(`file:///${randomNumber}${metaData.fileExtensions[0]}`);
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(model, uri)
    services.shared.workspace.LangiumDocuments.addDocument(document)
    await services.shared.workspace.DocumentBuilder.build([document], { })
    document.parseResult.value.$container?.$document
    return document.parseResult.value as PCM
}

