// import { Action, SetModelAction } from "sprotty-protocol";
import { VscodeDiagramServer } from "sprotty-vscode-webview";


export class AuroraVSCodeDiagramServer extends VscodeDiagramServer {


    // override handleLocally(action: Action): boolean {
    //     if (action.kind === SetModelAction.KIND) {
    //         console.log('SetModel Action Request detected by Aurora VSCode Server...')
    //         return this.handleSetModelAction(action as SetModelAction);
    //     } else {
    //         return super.handleLocally(action);
    //     }
    // }

    // private handleSetModelAction(action: SetModelAction): boolean {
    //     console.log('Layout Action being handled by Aurora VSCode Server...')
    //     const sModel = this.currentRoot
    //     // console.log('Updated Layout Engine: ', this.layoutEngine)
    //     this.actionDispatcher.dispatch(SetModelAction.create(sModel))
    //     return false
    // }
}