/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { DefaultScopeComputation, MultiMap, AstUtils } from 'langium'

import type {AstNode,AstNodeDescription,LangiumDocument,PrecomputedScopes} from 'langium'
import { isIssueCoordinate,isMODULE,isOrderCoordinate} from './generated/ast.js'
import type { PCM } from './generated/ast.js'
import { AuroraServices } from './aurora-module.js'

export class AuroraScopeComputation extends DefaultScopeComputation {

  constructor(services:AuroraServices) {
    super(services)
  }

  override async computeExports(
    document: LangiumDocument
  ): Promise<AstNodeDescription[]> {
    const exportedDescriptions: AstNodeDescription[] = []

    for (const childNode of AstUtils.streamAllContents(document.parseResult.value)) {
      if (isIssueCoordinate(childNode) && childNode.name) {
        exportedDescriptions.push(
          this.descriptions.createDescription(
            childNode,
            childNode.name,
            document
          )
        )
      }
      if (isOrderCoordinate(childNode) && childNode.name) {
        exportedDescriptions.push(
          this.descriptions.createDescription(
            childNode,
            childNode.name,
            document
          )
        )
      }
      if (isMODULE(childNode) && childNode.name) {
        exportedDescriptions.push(
          this.descriptions.createDescription(
            childNode,
            childNode.name,
            document
          )
        )
      }
    }
    return exportedDescriptions
  }

  override async computeLocalScopes(
    document: LangiumDocument
  ): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as PCM
    const scopes = new MultiMap<AstNode, AstNodeDescription>()
    this.processContainer(model, scopes, document)
    return scopes
  }

  private processContainer(
    container: PCM,
    scopes: PrecomputedScopes,
    document: LangiumDocument
  ): AstNodeDescription[] {
    const localDescriptions: AstNodeDescription[] = []
    for (const element of AstUtils.streamAllContents(container)) {
      if (isIssueCoordinate(element) && element.name) {
        localDescriptions.push(
          this.descriptions.createDescription(
            element,
            element.name,
            document
          )
        )
      }
      if (isOrderCoordinate(element) && element.name) {
        localDescriptions.push(
          this.descriptions.createDescription(
            element,
            element.name,
            document
          )
        )
      }
      if (isMODULE(element) && element.name) {
        localDescriptions.push(
          this.descriptions.createDescription(
            element,
            element.name,
            document
          )
        )
      }
    }
    scopes.addAll(container, localDescriptions)
    return localDescriptions
  }
}
