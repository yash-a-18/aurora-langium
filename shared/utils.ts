import { LayoutOptions } from "elkjs";
import { DefaultLayoutConfigurator } from "sprotty-elk";
import { Action, SGraph, SModelIndex, SNode, SPort} from "sprotty-protocol"
import { NotificationType } from 'vscode-messenger-common';

export const UPDATE_LAYOUT_ACTION_KIND = 'updateLayout';

export interface UpdateLayoutAction extends Action {
    kind: typeof UPDATE_LAYOUT_ACTION_KIND;
    layout: string;
}

export var currentLayout = 'stress'

export function setCurrentLayout(alg: string): void {
    currentLayout = alg
}

export function getCurrentLayout(): string {
    return currentLayout
}

export class AuroraLayoutConfigurator extends DefaultLayoutConfigurator {

    protected override graphOptions(sgraph: SGraph, index: SModelIndex): LayoutOptions {
        return {
            "elk.algorithm": getCurrentLayout(), 
            'org.eclipse.elk.stress.desiredEdgeLength': '100'
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

export const HIDE_NGOS_ACTION_KIND = 'hideNGOs';

export interface HideNGOsAction extends Action {
    kind: typeof HIDE_NGOS_ACTION_KIND;
    ocNames: string[];
    children: string[];
}

export const HIDE_NARRATIVES_ACTION_KIND = 'hideNarratives';

export interface HideNarrativesAction extends Action {
    kind: typeof HIDE_NARRATIVES_ACTION_KIND;
    narratives: string[];
}

export const MOUSEWHEEL_HIDE_ACTION_KIND = 'mouseWheelHide';

export interface MouseWheelHideAction extends Action {
    kind: typeof MOUSEWHEEL_HIDE_ACTION_KIND;
    ocNames: string[];
    ocChildren: string[];
    standaloneNars: string[]
}

export interface ElementSelectedMessage {
    elementID: string
}

export const ElementSelectedNotification: NotificationType<ElementSelectedMessage> = { method: 'elementSelected' };

export interface HideMessage {
    state: number
}

export const HideNotification: NotificationType<HideMessage> = { method: 'state' };