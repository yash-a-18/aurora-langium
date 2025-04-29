import { Action} from "sprotty-protocol"

export const UPDATE_LAYOUT_ACTION_KIND = 'updateLayout';

export interface UpdateLayoutAction extends Action {
    kind: typeof UPDATE_LAYOUT_ACTION_KIND;
    layout: string;
}

export var currentLayout = 'layered'

export function setCurrentLayout(alg: string): void {
    currentLayout = alg
}

export function getCurrentLayout(): string {
    return currentLayout
}