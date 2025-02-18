/** @jsx svg */
import { svg, RenderingContext, ShapeView, isEdgeLayoutable, setAttr, SLabelImpl } from "sprotty";
import { getSubType } from "sprotty-protocol";
import { VNode } from "snabbdom";
import { injectable } from 'inversify';


@injectable()
export class DarkTextLabelView extends ShapeView {
    render(label: Readonly<SLabelImpl>, context: RenderingContext): VNode | undefined {
        if (!isEdgeLayoutable(label) && !this.isVisible(label, context)) {
            return undefined;
        }
        const vnode = <text class-sprotty-darktext-label={true}>{label.text}</text>;
        const subType = getSubType(label);
        if (subType) {
            setAttr(vnode, 'class', subType);
        }
        return vnode;
    }
}