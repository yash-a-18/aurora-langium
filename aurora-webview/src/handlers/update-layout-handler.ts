import { injectable, inject } from 'inversify';
import { ModelSource, TYPES, type IActionHandler } from 'sprotty';
import { type Action } from 'sprotty-protocol'
const shared = require('../../../shared/utils')

@injectable()
export class UpdateLayoutActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: ModelSource
    ) {}

    handle(action: Action): void {
        const layout: string = (action as any).layout;
        console.log(`[aurora-webview] Changing layout to: ${layout}`);
        // this is the way to call pre-set actions (handy syntax to keep on file, but does not seem to work for triggering layout changes specifically)
        // this.modelSource.actionDispatcher.dispatch(someAction) 

        // currently inspecting elk-layout.spec.ts for more knowledge
    }

    accepts(action: Action): boolean {
        return action.kind === shared.UPDATE_LAYOUT_ACTION_KIND;
    }
}
