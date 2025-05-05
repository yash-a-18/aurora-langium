import { type AstNode, type MaybePromise} from 'langium';
import { AstUtils } from 'langium';
import { AstNodeHoverProvider } from 'langium/lsp';
import type { Hover } from 'vscode-languageserver-protocol'
import {  IssueCoordinate, Issues, MODULE, OrderCoordinate, Orders, PCM, isIssueCoordinate, isIssues, isOrderCoordinate } from './generated/ast.js'


function modulesFromPCM(p: PCM) : MODULE [] {
   return p.elements
    .filter(elem => isIssues(elem))
    .map(elem =>  elem as Issues)
    .flatMap(issues => issues.coord)
    .flatMap(x=> x.mods!)
    .map(x=>x.ref)
    .filter(m => m != undefined)
    .map(x=> x as MODULE)
}

export function icFromModule(p : PCM): IssueCoordinate[]{
    return modulesFromPCM(p).flatMap(x=>x.elements).filter(m => m.$type == "Issues")
    .map(x=> x as Issues)
    .flatMap(i => i.coord)
}

export function ocFromModule(p : PCM): OrderCoordinate[]{
    return modulesFromPCM(p).flatMap(x=>x.elements).filter(m => m.$type == "Orders")
    .map(x=> x as Orders)
    .flatMap(i => i.namedGroups).flatMap(x=>x.orders).filter(x=> isOrderCoordinate(x)).map(x=> x as OrderCoordinate)
}
export class AuroraHoverProvider extends AstNodeHoverProvider {
    genHoverIC(p:AstNode, id : string) : string {
        let rPCM = (AstUtils.findRootNode(p) as PCM)
        if (rPCM.module == undefined && rPCM.template == undefined){
            let filteredIC = icFromModule(rPCM).filter(i=> id === i.name)
            if (filteredIC.length != 0){
                return filteredIC[0].comment.toString().replace("/*","").replace("*/", "").trimStart().trimEnd()
            }else{
                return "Coordinate of Care For Issues"
            }
        }else{
            return "Coordinate of Care For Issues"
        }
    }
    genHoverOC(p:AstNode, id : string) : string {
        let rPCM = (AstUtils.findRootNode(p) as PCM)
        if (rPCM.module == undefined && rPCM.template == undefined){
            let filteredOC = ocFromModule(rPCM).filter(i=> id === i.name)
            if (filteredOC.length != 0){
                return filteredOC[0].comment.toString().replace("/*","").replace("*/", "").trimStart().trimEnd()
            }else{
                return "Coordinate of Care for Orders"
            }
        }else{
            return "Coordinate of Care for Orders"
        }

    }
    protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
        if (isIssueCoordinate(node)) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: this.genHoverIC(node, (node as IssueCoordinate).name)
                }
            }
        }
        else if (isOrderCoordinate(node)) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: this.genHoverOC(node, (node as OrderCoordinate).name)
                    }
            }
        }
        else {
            return undefined;
        }
    }
}