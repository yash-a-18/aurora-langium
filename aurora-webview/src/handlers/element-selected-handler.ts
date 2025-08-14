import { IActionHandler } from 'sprotty';
import { injectable, inject } from 'inversify';
import { SelectAction, type Action } from 'sprotty-protocol';
import { VsCodeMessenger } from 'sprotty-vscode-webview/lib/services';
import { Messenger } from 'vscode-messenger-webview';
import { HOST_EXTENSION } from 'vscode-messenger-common';
const shared = require('../../../shared/utils');

@injectable()
export class ElementSelectedActionHandler implements IActionHandler {
    constructor(
        @inject(VsCodeMessenger) private readonly messenger: Messenger
    ){}
    handle(action: Action) {
        if (action.kind === SelectAction.KIND) {            
            const selectedNode = (action as SelectAction).selectedElementsIDs[0]
            console.log('Selection received by Sprotty Handler (Aurora-Webview): ', selectedNode)   
            const message = {
            elementID: selectedNode
            };  
            this.messenger.sendNotification(shared.ElementSelectedNotification, HOST_EXTENSION, message); 
        }
    }
}
