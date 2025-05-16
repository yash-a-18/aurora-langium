import { IActionHandler } from 'sprotty';
import { injectable } from 'inversify';
import { SelectAction, type Action } from 'sprotty-protocol';
// import * as vscode from 'vscode'

@injectable()
export class ElementSelectedActionHandler implements IActionHandler {
    handle(action: Action) {
        if (action.kind === SelectAction.KIND) {
            
            const selectedNode = (action as SelectAction).selectedElementsIDs[0]
            console.log('selection: ', selectedNode)
            // vscode.commands.executeCommand('diagram.revealSelectedElementRange', selectedNode)
        }
    }
}
