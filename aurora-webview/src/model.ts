import {CreatingOnDrag, PolylineEdgeRouter, RectangularNode,
    RectangularPort, SRoutableElementImpl, SEdgeImpl,
    SLabelImpl
} from 'sprotty';

import { Action, SEdge as SEdgeSchema } from 'sprotty-protocol';
import { EdgePlacement, CreateElementAction } from 'sprotty-protocol';


export class StatesEdge extends SEdgeImpl {
    override routerKind = PolylineEdgeRouter.KIND;
    override targetAnchorCorrection = Math.sqrt(5);
}
export class NegativeEdge extends SEdgeImpl {
    override routerKind = PolylineEdgeRouter.KIND;
    override targetAnchorCorrection = Math.sqrt(5);
    // override opacity = .1
}
export class DraftEdge extends SEdgeImpl {
    override routerKind = PolylineEdgeRouter.KIND;
    override targetAnchorCorrection = Math.sqrt(5);
}
export class UrgentEdge extends SEdgeImpl {
    override routerKind = PolylineEdgeRouter.KIND;
    override targetAnchorCorrection = Math.sqrt(5);
}
export class StatesEdgeLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement> {
        rotate: true,
        position: 0.6
    };
}


export class StatesNode extends RectangularNode {
    override canConnect(routable: SRoutableElementImpl, role: string) {
        return true;
    }
}

export class NarrativeNode extends RectangularNode {
    override canConnect(routable: SRoutableElementImpl, role: string) {
        return true;
    }
}

export class CreateTransitionPort extends RectangularPort implements CreatingOnDrag {
    createAction(id: string): Action {
        const edge: SEdgeSchema = {
            id,
            type: 'edge',
            sourceId: this.parent.id,
            targetId: this.id
        };
        return CreateElementAction.create(edge, { containerId: this.root.id });
    }
}