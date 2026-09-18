import { ManhattanEdgeRouter, ManhattanRouterOptions, SRoutableElementImpl, edgeInProgressID } from "sprotty";

export class CustomRouter extends ManhattanEdgeRouter {
    override getOptions(edge: SRoutableElementImpl): ManhattanRouterOptions {
        const defaultOptions = super.getOptions(edge);
        return edge.id === edgeInProgressID
            ? { ...defaultOptions, standardDistance: 1 }
            : defaultOptions;
    }
}