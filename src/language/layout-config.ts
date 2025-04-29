import { LayoutOptions } from 'elkjs';
import { DefaultLayoutConfigurator } from 'sprotty-elk';
import { SGraph, SModelIndex, SNode, SPort } from 'sprotty-protocol';

export class AuroraLayoutConfigurator extends DefaultLayoutConfigurator {

    private layoutAlgorithm!: string;

    constructor(alg: string) {
        super()
        this.layoutAlgorithm = alg 
    }
    
    set diagramLayout(alg: string) {
        this.layoutAlgorithm = alg
    }

    get diagramLayout() {
        return this.layoutAlgorithm
    }

    protected override graphOptions(sgraph: SGraph, index: SModelIndex): LayoutOptions {
        console.log("Layout:", this.layoutAlgorithm)
        return {
            "elk.algorithm": this.layoutAlgorithm, 
            'org.eclipse.elk.stress.desiredEdgeLength': '100.0',
        };
    }

    protected override nodeOptions(snode: SNode, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.portAlignment.default': 'CENTER',
            'org.eclipse.elk.portConstraints': 'FIXED_SIDE'
        };
    }

    protected override portOptions(sport: SPort, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.port.side': 'EAST',
            'org.eclipse.elk.port.borderOffset': '3.0'
        };
    }

}