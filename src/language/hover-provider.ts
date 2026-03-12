import type { AstNode, MaybePromise } from 'langium';
import { AstUtils } from 'langium';
import { AstNodeHoverProvider } from 'langium/lsp';
import {
    type IssueCoordinate,
    type Issues,
    type MODULE,
    type OrderCoordinate,
    type Orders,
    type PCM,
    isIssueCoordinate,
    isIssues,
    isOrderCoordinate
} from './generated/ast.js';

function sanitizeComment(raw: string): string {
    return raw.replace(/\/\*/g, '').replace(/\*\//g, '').trim();
}

function modulesFromPCM(model: PCM): MODULE[] {
    return model.elements
        .filter(element => isIssues(element))
        .map(element => element as Issues)
        .flatMap(issues => issues.coord)
        .flatMap(issue => issue.mods ?? [])
        .map(mod => mod.ref)
        .filter((mod): mod is MODULE => mod !== undefined);
}

export function icFromModule(model: PCM): IssueCoordinate[] {
    return modulesFromPCM(model)
        .flatMap(module => module.elements)
        .filter(element => element.$type === 'Issues')
        .map(element => element as Issues)
        .flatMap(issueGroup => issueGroup.coord);
}

export function ocFromModule(model: PCM): OrderCoordinate[] {
    return modulesFromPCM(model)
        .flatMap(module => module.elements)
        .filter(element => element.$type === 'Orders')
        .map(element => element as Orders)
        .flatMap(orderGroup => orderGroup.namedGroups)
        .flatMap(group => group.orders)
        .filter(isOrderCoordinate)
        .map(order => order as OrderCoordinate);
}

export class AuroraHoverProvider extends AstNodeHoverProvider {

    private genHoverIC(node: AstNode, id: string): string {
        const root = AstUtils.findRootNode(node) as PCM;
        if (root.module === undefined && root.template === undefined) {
            const filtered = icFromModule(root).filter(issue => id === issue.name);
            if (filtered.length > 0) {
                return sanitizeComment(filtered[0].comment.join('\n'));
            }
        }
        return 'Coordinate of Care For Issues';
    }

    private genHoverOC(node: AstNode, id: string): string {
        const root = AstUtils.findRootNode(node) as PCM;
        if (root.module === undefined && root.template === undefined) {
            const filtered = ocFromModule(root).filter(order => id === order.name);
            if (filtered.length > 0) {
                return sanitizeComment(filtered[0].comment.join('\n'));
            }
        }
        return 'Coordinate of Care for Orders';
    }

    protected getAstNodeHoverContent(node: AstNode): MaybePromise<string | undefined> {
        if (isIssueCoordinate(node)) {
            return this.genHoverIC(node, node.name);
        }

        if (isOrderCoordinate(node)) {
            return this.genHoverOC(node, node.name);
        }

        return undefined;
    }
}
