import { injectable, inject } from 'inversify';
import { TYPES, type IActionHandler } from 'sprotty';
import { LayoutAction, type Action } from 'sprotty-protocol'
import { VscodeDiagramServer } from 'sprotty-vscode-webview';
const shared = require('../../../shared/utils')

@injectable()
export class UpdateLayoutActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: VscodeDiagramServer
    ) {}

    handle(action: Action): void {
        const layout: string = (action as any).layout;
        console.log(`[aurora-webview] Changing layout to: ${layout}`);
        console.log('client id: ' + this.modelSource.clientId)
        this.modelSource.handle(LayoutAction.create({layoutType: layout}))        
    }

    accepts(action: Action): boolean {
        return action.kind === shared.UPDATE_LAYOUT_ACTION_KIND;
    }
}
