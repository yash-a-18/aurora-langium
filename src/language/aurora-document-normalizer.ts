import { AstUtils, type LangiumDocument } from 'langium';
import { isNamedGroupClinical } from './generated/ast.js';

export function normalizeClinicalGroupTimestamps(document: LangiumDocument): void {
    const text = document.textDocument.getText();

    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
        if (!isNamedGroupClinical(node) || node.timestamp || node.coord.length === 0 || !node.$cstNode) {
            continue;
        }

        const firstCoordinate = node.coord[0];
        const timestampNode = firstCoordinate.timestamp?.$cstNode;
        if (!timestampNode) {
            continue;
        }

        const groupLineEnd = findLineEndOffset(text, node.$cstNode.offset);
        if (timestampNode.end > groupLineEnd) {
            continue;
        }

        const groupLine = text.slice(node.$cstNode.offset, groupLineEnd);
        if (!groupLine.startsWith(node.name)) {
            continue;
        }

        const nameEnd = node.$cstNode.offset + node.name.length;
        const between = text.slice(nameEnd, timestampNode.offset);
        if (/\S/.test(between)) {
            continue;
        }

        const trailing = text.slice(timestampNode.end, groupLineEnd);
        if (/\S/.test(trailing)) {
            continue;
        }

        node.timestamp = firstCoordinate.timestamp;
        firstCoordinate.timestamp = undefined;
    }
}

function findLineEndOffset(text: string, offset: number): number {
    let index = offset;
    while (index < text.length && text[index] !== '\n' && text[index] !== '\r') {
        index++;
    }
    return index;
}
