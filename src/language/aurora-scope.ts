/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { AstUtils, DefaultScopeComputation, DefaultScopeProvider, MultiMap } from 'langium';
import type { AstNode, AstNodeDescription, LangiumDocument, LocalSymbols } from 'langium';
import { isClinicalItem, isDefinition, isIssueCoordinate, isMODULE, isOrderCoordinate } from './generated/ast.js';
import type { PCM } from './generated/ast.js';
import type { AuroraServices } from './aurora-module.js';

export class AuroraScopeProvider extends DefaultScopeProvider {}

export class AuroraScopeComputation extends DefaultScopeComputation {

    constructor(services: AuroraServices) {
        super(services);
    }

    override async collectExportedSymbols(document: LangiumDocument): Promise<AstNodeDescription[]> {
        const exportedDescriptions = await super.collectExportedSymbols(document);
        const existing = new Set(exportedDescriptions.map(descriptionKey));

        for (const childNode of AstUtils.streamAllContents(document.parseResult.value)) {
            if (isClinicalItem(childNode) && childNode.name) {
                const desc = this.descriptions.createDescription(childNode, childNode.name, document);
                addIfMissing(exportedDescriptions, existing, desc);
            }
            if (isIssueCoordinate(childNode) && childNode.name) {
                const desc = this.descriptions.createDescription(childNode, childNode.name, document);
                addIfMissing(exportedDescriptions, existing, desc);
            }
            if (isOrderCoordinate(childNode) && childNode.name) {
                const desc = this.descriptions.createDescription(childNode, childNode.name, document);
                addIfMissing(exportedDescriptions, existing, desc);
            }
            if (isMODULE(childNode) && childNode.name) {
                const desc = this.descriptions.createDescription(childNode, childNode.name, document);
                addIfMissing(exportedDescriptions, existing, desc);
            }
            if (isDefinition(childNode) && typeof childNode.name === 'string' && childNode.name.endsWith(':')) {
                const desc = this.descriptions.createDescription(
                    childNode,
                    normalizeDefinitionName(childNode.name),
                    document
                );
                addIfMissing(exportedDescriptions, existing, desc);
            }
        }

        return exportedDescriptions;
    }

    override async collectLocalSymbols(document: LangiumDocument): Promise<LocalSymbols> {
        const symbols = await super.collectLocalSymbols(document) as MultiMap<AstNode, AstNodeDescription>;
        const model = document.parseResult.value as PCM;

        const localDescriptions: AstNodeDescription[] = [];
        for (const element of AstUtils.streamAllContents(model)) {
            if (isClinicalItem(element) && element.name) {
                localDescriptions.push(this.descriptions.createDescription(element, element.name, document));
            }
            if (isIssueCoordinate(element) && element.name) {
                localDescriptions.push(this.descriptions.createDescription(element, element.name, document));
            }
            if (isOrderCoordinate(element) && element.name) {
                localDescriptions.push(this.descriptions.createDescription(element, element.name, document));
            }
            if (isMODULE(element) && element.name) {
                localDescriptions.push(this.descriptions.createDescription(element, element.name, document));
            }
            if (isDefinition(element) && typeof element.name === 'string' && element.name.endsWith(':')) {
                localDescriptions.push(
                    this.descriptions.createDescription(
                        element,
                        normalizeDefinitionName(element.name),
                        document
                    )
                );
            }
        }

        symbols.addAll(model, localDescriptions);
        return symbols;
    }
}

function addIfMissing(collection: AstNodeDescription[], index: Set<string>, description: AstNodeDescription): void {
    const key = descriptionKey(description);
    if (index.has(key)) {
        return;
    }
    collection.push(description);
    index.add(key);
}

function descriptionKey(description: AstNodeDescription): string {
    return `${description.name}|${description.type}|${description.documentUri.toString()}|${description.path}`;
}

function normalizeDefinitionName(name: string): string {
    return name.endsWith(':') ? name.slice(0, -1) : name;
}
