import { IActionHandler, TYPES } from 'sprotty';
import { injectable, inject } from 'inversify';
import { SModelElement, SModelRoot, SNode, UpdateModelAction, type Action } from 'sprotty-protocol';
import { VscodeDiagramServer } from 'sprotty-vscode-webview';
const shared = require('../../../shared/utils');


@injectable()
export class HideNGOsActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: VscodeDiagramServer
    ) {}

    handle(action: Action) {
        if (action.kind === shared.HIDE_NGOS_ACTION_KIND) {
            const ocNames = (action as any).ocNames;
            const updatedRoot = this.markNodesHidden(this.modelSource.model, ocNames);
            this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(updatedRoot, {animate: false}));      
        }        
    }

    private markNodesHidden(root: SModelRoot, idsToHide: string[]): SModelRoot {
        const updatedChildren: SModelElement[] = [];

        for (const element of root.children || []) {
            if (this.isEdge(element)) {
                const source = (element as any).sourceId;
                const target = (element as any).targetId;

                if (idsToHide.includes(source) || idsToHide.includes(target)) {
                    continue; 
                }

                updatedChildren.push(element); 
            } else if (this.isNode(element)) {
                const updatedNode = this.hideNode(element, idsToHide);
                updatedChildren.push(updatedNode);
            } else {
                updatedChildren.push(element); 
            }
        }

        return {
            ...root,
            children: updatedChildren
        };
    }


    private hideNode(element: SModelElement, nodeNames: string[]): SModelElement {
        const name = element.id; 

        if (name && nodeNames.includes(name)) {
            return {
                type: 'node:hidden',
                id: element.id,
                children: [],
                layout: 'stack',
                layoutOptions: {paddingTop: 10.0,paddingBottom: 10.0,paddingLeft: 10.0, paddingRight: 10.0
                }
            } as SNode;
        }

        return element;
    }

    private isEdge(element: SModelElement): boolean {
    return 'sourceId' in element && 'targetId' in element;
    }

    private isNode(element: SModelElement): boolean {
        return !this.isEdge(element);
    }

}
