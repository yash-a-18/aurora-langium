import { Action} from "sprotty-protocol"

export const UPDATE_LAYOUT_ACTION_KIND = 'updateLayout';

export interface UpdateLayoutAction extends Action {
    kind: typeof UPDATE_LAYOUT_ACTION_KIND;
    layout: string;
}
