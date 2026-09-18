import { SModelElement, SModelRoot, SNode } from 'sprotty-protocol';

export function markNodesHidden(
    root: SModelRoot,
    idsToHide: string[],
    removeOnlyEdges = false
): SModelRoot {
    const updatedChildren: SModelElement[] = [];

    for (const element of root.children || []) {
        if (isEdge(element)) {
            const source = (element as any).sourceId;
            const target = (element as any).targetId;

            if (idsToHide.includes(source) || idsToHide.includes(target)) {
                continue; // skip edge
            }

            updatedChildren.push(element);
        } else if (isNode(element)) {
            if (!removeOnlyEdges) {
                const updatedNode = hideNode(element, idsToHide);
                updatedChildren.push(updatedNode);
            } else {
                updatedChildren.push(element);
            }
        } else {
            updatedChildren.push(element);
        }
    }

    return {
        ...root,
        children: updatedChildren
    };
}

function hideNode(element: SModelElement, nodeNames: string[]): SModelElement {
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

function isEdge(element: SModelElement): boolean {
    return 'sourceId' in element && 'targetId' in element;
}

function isNode(element: SModelElement): boolean {
        return !isEdge(element);
}