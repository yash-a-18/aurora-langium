import { IActionHandler, TYPES } from 'sprotty';
import { injectable, inject } from 'inversify';
import { UpdateModelAction, type Action } from 'sprotty-protocol';
import { VscodeDiagramServer } from 'sprotty-vscode-webview';
import { markNodesHidden } from './utils';
const shared = require('../../../shared/utils');


@injectable()
export class HideNGOsActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: VscodeDiagramServer
    ) {}

    handle(action: Action) {
        if (action.kind === shared.HIDE_NGOS_ACTION_KIND) {
            const nodesToHide: string[] = (action as any).ocNames.concat((action as any).children);

            const withoutEdges = markNodesHidden(this.modelSource.model, nodesToHide, true);
            this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(withoutEdges, {animate: true}));

            setTimeout(() => {
                const updatedRoot = markNodesHidden(this.modelSource.model, nodesToHide, false);
                this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(updatedRoot, {animate: true}));
            }, 5);      
        }        
    }

}
