import { GeneratorContext, IdCache, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SModelElement, SNode } from 'sprotty-protocol';
import { AstNode, AstUtils, Reference } from 'langium';
import { IssueCoordinate, Issues, NamedGroupOrder, NL_STATEMENT, OrderCoordinate, Orders, PCM, ReferenceCoordinate, QuReferences } from './generated/ast.js';

var ngoFilter: string[] = []
export function clearNGOFilter(): void  {ngoFilter = []}
export function addToNGOFilter(s: string[]): void  {ngoFilter = [ ...ngoFilter, ...s] }
export function getNgoFilter() :string[] {return ngoFilter}

function listOfNarratives(a: AstNode): NL_STATEMENT[] {
    return AstUtils.streamAllContents(a)
      .toArray()
      .filter((i) => i.$type == "NL_STATEMENT") as NL_STATEMENT[];
}

export function extractQURefsArray(qurc: QuReferences | undefined): { qu: string[]; refs: Reference<ReferenceCoordinate>[] } {
    const qu: string[] = [];
    const refs: Reference<ReferenceCoordinate>[] = [];

    if (qurc) {
        for (const qref of qurc.quRefs ?? []) {
            for (const q of qref.qu ?? []) {
                qu.push(q.query);
            }
            if (qref.ref) {
                refs.push(qref.ref as Reference<ReferenceCoordinate>);
            }
        }
    }
    return { qu, refs };
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
                ...ic.map(x=> this.generateIC(x, args)).filter(Boolean),
                ...oc.map(x=> this.generateOC(x, args)).filter(Boolean),
                ...nar.map(x=> this.generateNar(x,args)).filter(Boolean),
                ...nar.map(x=> this.generateNLEdge(x, args)).filter(Boolean),
                ...oc.flatMap(x=> this.generateEdges(x, args)).filter(Boolean),
                ...ic.filter(i => extractQURefsArray(i.qurc).refs.length > 0).flatMap(x => this.generateEdges(x, args)).filter(Boolean)
            ] as SModelElement[]
        };
    }
    protected generateNar(nl: NL_STATEMENT, { idCache }: GeneratorContext<PCM>): SModelElement {
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
        } as SNode;
    }
    protected generateIC(state: IssueCoordinate, { idCache }: GeneratorContext<PCM>): SModelElement {
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
        } as SNode;
    }
    protected generateOC(oc: OrderCoordinate, { idCache }: GeneratorContext<PCM>): SModelElement {
        var i = "node:oc"
        if (extractQURefsArray(oc.qurc).refs.length == 0){
            i = "node:ocorphan"
        }
        const nodeId = idCache.uniqueId(oc.name, oc);
        return {
            type: i,
            id: nodeId,
            children: [<SLabel>{ type: 'label:darktext', id: idCache.uniqueId(nodeId + '.label'), text: oc.name}],
            layout: 'stack',
            layoutOptions: { paddingTop: 10.0, paddingBottom: 10.0, paddingLeft: 10.0, paddingRight: 10.0            }
        } as SNode;
    }
    // TODO, change this from ic -> (to, from )
    protected generateEdges(ic: IssueCoordinate|OrderCoordinate, { idCache }: GeneratorContext<PCM>): SEdge[] {
        const sourceId = idCache.getId(ic);
        const edges: SEdge[] = [];

        if (ic.qurc) { // Ensure ic.qurc is not undefined
            for (const qurc of Array.isArray(ic.qurc) ? ic.qurc : [ic.qurc]) { // Ensure qurc is iterable
                for (const qref of qurc.quRefs ?? []) {
                    const hasQU = qref.qu?.length > 0;
                    const type = hasQU ? 'edge:negative' : 'edge';
                    if (qref.ref) {
                        const edge = this.generateEdge(ic, sourceId, qref.ref, idCache, type);
                        if (edge) {
                            edges.push(edge);
                        }
                    }
                }
            }
        }
        return edges;
    }

    protected generateEdge(ic: IssueCoordinate|OrderCoordinate, sourceId: string | undefined, ref: Reference<ReferenceCoordinate>, idCache: IdCache<AstNode>, type: string): SEdge | undefined {
        
        // Check if ref exists
        if (!ref.ref) {
            console.warn(`No valid reference found for ${ic.name}`);
            return undefined;
        }

        const targetId = idCache.getId(ref.ref);
        
        // Check if both IDs are valid
        if (!sourceId || !targetId) {
            console.warn(`Invalid source or target ID for ${ic.name}`);
            return undefined;
        }

        const edgeId = idCache.uniqueId(`${sourceId}:${ref.$refNode?.text ?? ''}:${targetId}`, ic);
        
        return {
            type: type,
            id: edgeId,
            sourceId: sourceId,
            targetId: targetId,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
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