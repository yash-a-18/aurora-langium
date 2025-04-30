import { injectable, inject } from 'inversify';
import { TYPES, type IActionHandler } from 'sprotty';
import { IModelLayoutEngine, SetModelAction, SModelRoot, type Action } from 'sprotty-protocol';
import { VscodeDiagramServer } from 'sprotty-vscode-webview';
const shared = require('../../../shared/utils');

@injectable()
export class UpdateLayoutActionHandler implements IActionHandler {

    constructor(
        @inject(TYPES.ModelSource) protected readonly modelSource: VscodeDiagramServer,
        @inject(TYPES.IModelLayoutEngine) protected readonly layoutEngine: IModelLayoutEngine
    ) {}

    handle(action: Action): void {
        if (this.layoutEngine) {
            console.log('Layout Engine Detected: ', this.layoutEngine);


            const model = this.modelSource.model;
            const layoutResult = this.layoutEngine.layout(model);
            
            if (layoutResult instanceof Promise) {
                layoutResult
                    .then((newModel: SModelRoot) => {
                        this.modelSource.actionDispatcher.dispatch(SetModelAction.create(newModel))
                        
                    })
                    .then(() => console.log('Model updated!'))
                    .catch((err: Error) => {
                        console.error('Layout computation failed:', err);
                    });
            } else {
                this.modelSource.actionDispatcher.dispatch(SetModelAction.create(layoutResult));
            }
        }
        else console.log('NO LAYOUT ENGINE!!!!! ', this.layoutEngine)
    }

    accepts(action: Action): boolean {
        return action.kind === shared.UPDATE_LAYOUT_ACTION_KIND;
    }
}
