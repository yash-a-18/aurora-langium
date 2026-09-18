import { IActionHandler, TYPES } from 'sprotty';
import { injectable, inject } from 'inversify';
import { UpdateModelAction, type Action } from 'sprotty-protocol';
import { VscodeDiagramServer } from 'sprotty-vscode-webview';
import { markNodesHidden } from './utils';
const shared = require('../../../shared/utils');


@injectable()
export class HideNarrativesActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: VscodeDiagramServer
    ) {}

    handle(action: Action) {
        if (action.kind === shared.HIDE_NARRATIVES_ACTION_KIND) {
            const narratives = (action as any).narratives;

            const withoutEdges = markNodesHidden(this.modelSource.model, narratives, true);
            this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(withoutEdges, {animate: true}));

            setTimeout(() => {
                const updatedRoot = markNodesHidden(this.modelSource.model, narratives, false);
                this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(updatedRoot, {animate: true}));
            }, 5); 
        }
    }


}
