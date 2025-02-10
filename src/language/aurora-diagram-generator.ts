import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode } from 'sprotty-protocol';
import { AstNode, AstUtils } from 'langium';
import { IssueCoordinate, Issues, NamedGroupOrder, NL_STATEMENT, OrderCoordinate, Orders, PCM } from './generated/ast.js';

var ngoFilter: string[] = []
export function clearNGOFilter(): void  {ngoFilter = []}
export function addToNGOFilter(s: string[]): void  {ngoFilter = [ ...ngoFilter, ...s] }
export function getNgoFilter() :string[] {return ngoFilter}

function listOfNarratives(a: AstNode): NL_STATEMENT[] {
    return AstUtils.streamAllContents(a)
      .toArray()
      .filter((i) => i.$type == "NL_STATEMENT") as NL_STATEMENT[];
}

export class AuroraDiagramGenerator extends LangiumDiagramGenerator {
    ngoFilter : string[] = []
    updateNGOFilter(s: string[]) {  {ngoFilter = [ ...ngoFilter, ...s] }}
    
    protected generateRoot(args: GeneratorContext<PCM>): SModelRoot {
        const { document } = args;
        const sm = document.parseResult.value;

        let ic : IssueCoordinate [] = sm.elements.filter(x => x.$type == "Issues").map(i => (i as Issues)).flatMap(x => x.coord)
        let ngo : NamedGroupOrder [] = sm.elements.filter(x => x.$type == "Orders").map(i => (i as Orders)).flatMap(x => x.namedGroups)
        let oc = ngo.filter(x=> this.ngoFilter.indexOf(x.name.replace(":","").trim()) === -1).flatMap(n=>n.orders).filter(x=> x.$type =="OrderCoordinate").map(x=>x as OrderCoordinate)
        let nar = listOfNarratives(sm).filter(x => x.$container.$type != "ClinicalCoordinate" && x.$container.$type != "NamedGroupOrder" && x.$container.$type != "NamedGroupClinical")
        return {
            type: 'graph',
            id: 'pcm',
            children: [
                ...ic.map(x=> this.generateIC(x, args)),
                ...oc.map(x=> this.generateOC(x, args)),
                ...nar.map(x=> this.generateNar(x,args)),
                ...nar. map(x=> this.generateNLEdge(x, args)),
                ...oc. map(x=> this.generateEdge(x, args)),
                ...ic.filter(i => i.refs.length != 0 ). map(x=> this.generateEdge(x, args))
            ]
        };
    }
    protected generateNar(nl: NL_STATEMENT, { idCache }: GeneratorContext<PCM>): SNode {
        const nodeId = idCache.uniqueId(nl.name, nl);
        var t = "node:nl" // Neutral Nar
        switch (nl.name.trim()[1].toString()){
            case '?' : t = "node:nldraft" ; break;
            case '!' : t = "node:nlexclamation" ; break;
            case 'x' : t = "node:nltaskcompleted" ; break;
            case '.' : t = "node:nltask" ; break;
            default :
        }
        return {
            type: t,
            id: nodeId, // TODO toggle dark text when different colors
            children: [<SLabel>{ type: 'label:darktext', id: idCache.uniqueId(nodeId + '.label'), text: nl.name}],
            layout: 'stack',
            layoutOptions: { paddingTop: 10.0, paddingBottom: 10.0, paddingLeft: 10.0, paddingRight: 10.0}
        };
    }
    protected generateIC(state: IssueCoordinate, { idCache }: GeneratorContext<PCM>): SNode {
        const nodeId = idCache.uniqueId(state.name, state);
        return {
            type: 'node:ic',
            id: nodeId,
            children: [
                <SLabel>{type: 'label',id: idCache.uniqueId(nodeId + '.label'),text: state.name}
            ],
            layout: 'stack',
            layoutOptions: {paddingTop: 10.0,paddingBottom: 10.0,paddingLeft: 10.0, paddingRight: 10.0
            }
        };
    }
    protected generateOC(oc: OrderCoordinate, { idCache }: GeneratorContext<PCM>): SNode {
        var i = "node:oc"
        if (oc.refs.length == 0){
            i = "node:ocorphan"
        }
        const nodeId = idCache.uniqueId(oc.name, oc);
        return {
            type: i,
            id: nodeId,
            children: [<SLabel>{ type: 'label:darktext', id: idCache.uniqueId(nodeId + '.label'), text: oc.name}],
            layout: 'stack',
            layoutOptions: { paddingTop: 10.0, paddingBottom: 10.0, paddingLeft: 10.0, paddingRight: 10.0            }
        };
    }
    // TODO, change this from ic -> (to, from )
    // And capture the ~ for the negative relationship
    protected generateEdge(ic: IssueCoordinate|OrderCoordinate, { idCache }: GeneratorContext<PCM>): SEdge {
        const sourceId = idCache.getId(ic);
        const targetId = idCache.getId(ic.refs[0].ref!);
        const edgeId = idCache.uniqueId(`${sourceId}:${ic.refs[0].$refNode!.text}:${targetId}`, ic);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    // text: transition.event?.ref?.name
                }
            ]
        };
    }
    protected generateNLEdge(nl: NL_STATEMENT, { idCache }: GeneratorContext<PCM>): SEdge {
        const sourceId = idCache.getId(nl);
        const targetId = idCache.getId(nl.$container);
        const edgeId = idCache.uniqueId(`${sourceId}:${nl.$container.$cstNode?.text}:${targetId}`, nl);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    // text: transition.event?.ref?.name
                }
            ]
        };
    }
}