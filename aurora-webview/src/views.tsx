/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { PolylineEdgeView, RenderingContext, svg, IView, SEdgeImpl } from 'sprotty';
import { Point, toDegrees, SPort } from 'sprotty-protocol';

@injectable()
export class PolylineArrowEdgeView extends PolylineEdgeView {

    protected override renderAdditionals(edge: SEdgeImpl, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-sprotty-edge-arrow={true} d='M 6,-3 L 0,0 L 6,3 Z'
                  transform={`rotate(${this.angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}

@injectable()
export class PolylineArrowNegativeEdgeView extends PolylineEdgeView {

    protected override renderLine(edge: SEdgeImpl, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0];
        let path = `M ${firstPoint.x},${firstPoint.y}`;
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i];
            path += ` L ${p.x},${p.y}`;
        }
        return <path d={path} class-sprotty-negative-edge={true} />;
    }

    protected override renderAdditionals(edge: SEdgeImpl, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-sprotty-negative-edge-arrow={true} d='M 6,-3 L 0,0 L 6,3 Z'
                  transform={`rotate(${this.angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}

@injectable()
export class TriangleButtonView implements IView {
    render(model: SPort, context: RenderingContext): VNode {
        return <path class-sprotty-button={true} d='M 0,0 L 8,4 L 0,8 Z' />;
    }
}