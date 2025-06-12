import { IActionHandler, TYPES } from 'sprotty';
import { injectable, inject } from 'inversify';
import { UpdateModelAction, type Action } from 'sprotty-protocol';
import { VscodeDiagramServer } from 'sprotty-vscode-webview';
import { markNodesHidden } from './utils';
const shared = require('../../../shared/utils');


@injectable()
export class MouseWheelHideActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: VscodeDiagramServer
    ) {}

    handle(action: Action) {
        if (action.kind === shared.MOUSEWHEEL_HIDE_ACTION_KIND) {
            const ocs: string[] = (action as any).ocNames
            const ocChildren: string[] = (action as any).ocChildren 
            const nars: string[] = (action as any).standaloneNars
            const nodes = [...ocs, ...ocChildren, ...nars]

            const withoutEdges = markNodesHidden(this.modelSource.model, nodes, true);
            this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(withoutEdges, {animate: false}));

            setTimeout(() => {
                const updatedRoot = markNodesHidden(this.modelSource.model, nodes, false);
                this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(updatedRoot, {animate: false}));
            }, 5); 
        }
    }


}
