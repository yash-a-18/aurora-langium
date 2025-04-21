import { injectable, inject } from 'inversify';
import { ModelSource, TYPES, type IActionHandler } from 'sprotty';
import { type Action } from 'sprotty-protocol'
const shared = require('../../../shared/utils')

@injectable()
export class UpdateLayoutActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: ModelSource,
        // @inject(TYPES.Action) protected readonly actionDispatcher: ActionDispatcher
    ) {}

    handle(action: Action): void {
        const layout = (action as any).layout;
        console.log(`[aurora-webview] Changing layout to: ${layout}`);

        // const root = this.modelSource.model; // assume the layout has been applied already
        // console.log('current root')
        // console.log(root)
        
        // this.actionDispatcher.dispatch(UpdateModelAction.create(root));
    }

    accepts(action: Action): boolean {
        return action.kind === shared.UPDATE_LAYOUT_ACTION_KIND;
    }
}
