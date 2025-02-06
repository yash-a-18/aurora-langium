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
      if (isIssueCoordinate(childNode)) {
        const fullyQualifiedName = childNode.name
        exportedDescriptions.push(
          this.descriptions.createDescription(
            childNode,
            fullyQualifiedName,
            document
          )
        )
      }
      if (isOrderCoordinate(childNode)) {
        const fullyQualifiedName = childNode.name
        exportedDescriptions.push(
          this.descriptions.createDescription(
            childNode,
            fullyQualifiedName,
            document
          )
        )
      }
      if (isMODULE(childNode)) {
        const fullyQualifiedName = childNode.name
        const description = this.descriptions.createDescription(
          childNode,
          fullyQualifiedName,
          document
        )
        exportedDescriptions.push(
          description
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
      if (isIssueCoordinate(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.name,
          document
        )
        localDescriptions.push(description)
      }
      if (isOrderCoordinate(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.name,
          document
        )
        localDescriptions.push(description)
      }
      if (isMODULE(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.name,
          document
        )
        localDescriptions.push(description)
      }
    }
    scopes.addAll(container, localDescriptions)
    return localDescriptions
  }
}
