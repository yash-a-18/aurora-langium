/** @jsx svg */

import { svg, IViewArgs, RenderingContext, ShapeView, SNodeImpl, SPortImpl, SShapeElementImpl} from "sprotty";
import { Hoverable, Selectable } from "sprotty-protocol";
import { VNode } from "snabbdom";
import { injectable } from 'inversify';

@injectable()
export class HiddenNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        return undefined
    }
}

@injectable()
export class NarrativeNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <ellipse class-sprotty-nl-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  cx={node.size.width * 0.5} cy={node.size.height * 0.5} 
                  rx={Math.max(node.size.width * 0.55, 0)} ry={Math.max(node.size.height * 0.65, 0)}></ellipse>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class NarrativeDraftNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <ellipse class-sprotty-nldraft-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  cx={node.size.width * 0.5} cy={node.size.height * 0.5} 
                  rx={Math.max(node.size.width * 0.55, 0)} ry={Math.max(node.size.height * 0.65, 0)}></ellipse>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class NarrativeExclamationNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <ellipse class-sprotty-nlexclamation-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  cx={node.size.width * 0.5} cy={node.size.height * 0.5} 
                  rx={Math.max(node.size.width * 0.55, 0)} ry={Math.max(node.size.height * 0.65, 0)}></ellipse>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class NarrativeTaskCompletedNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <ellipse class-sprotty-nltaskcompleted-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  cx={node.size.width * 0.5} cy={node.size.height * 0.5} 
                  rx={Math.max(node.size.width * 0.55, 0)} ry={Math.max(node.size.height * 0.65, 0)}></ellipse>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class NarrativeTaskNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <ellipse class-sprotty-nltask-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  cx={node.size.width * 0.5} cy={node.size.height * 0.5} 
                  rx={Math.max(node.size.width * 0.55, 0)} ry={Math.max(node.size.height * 0.65, 0)}></ellipse>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class IssueCoordinateNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-ic-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class IssueCoordinateDraftNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-ic-draft-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class IssueCoordinateUrgentNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-ic-urgent-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class IssueCoordinateNegativeNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-ic-negative-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class LogicalNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-logic-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}


@injectable()
export class NamedGroupLogicNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <ellipse class-sprotty-ngl-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  cx={node.size.width*0.5} cy={node.size.height*0.5} rx={node.size.width*0.55} ry={node.size.height*0.65}></ellipse>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-oc-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateSelectedNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-ocselected-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateExclamationNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-nlexclamation-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateNegativeNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-nlnegative-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateDraftNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-nldraft-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateTaskNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-nltask-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateTaskCompletedNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-nltaskcompleted-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class OrderCoordinateOrphanNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-orphan-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-regular-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementExclamationNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-exclamation-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementDraftNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-draft-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementTaskNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-task-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementTaskCompletedNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-taskcompleted-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementPastNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-regular-past-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementExclamationPastNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-exclamation-past-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementDraftPastNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-draft-past-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementTaskPastNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-task-past-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class FhirMapElementTaskCompletedPastNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-fhir-me-taskcompleted-past-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}