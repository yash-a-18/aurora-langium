import { injectable, inject } from 'inversify';
import { TYPES, type IActionHandler } from 'sprotty';
import { cloneModel, IModelLayoutEngine, SModelRoot, UpdateModelAction, type Action } from 'sprotty-protocol';
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
            console.log('Current Layout Engine Detected: ', this.layoutEngine);
            const updatedLayout = (action as any).layout
            
            console.log('Updating Engine to: ', updatedLayout)
            shared.setCurrentLayout(updatedLayout)

            console.log('Detecting Updated Layout Engine: ', this.layoutEngine)

            const model = this.modelSource.model;
            const clone = cloneModel(model)
            clone.id = clone.id + '_' + clone.revision /* Need to change ID to trigger full re-rendering */
            
            const layoutResult = this.layoutEngine.layout(clone);

            console.log('Detecting Layout Result: ', layoutResult)
            
            if (layoutResult instanceof Promise) {
                layoutResult
                    .then((newModel: SModelRoot) => {
                        this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(newModel)).then(() => console.log('Model updated!'))  
                    })
                    .catch((err: Error) => {
                        console.error('Layout computation failed:', err);
                    });
            } else {
                this.modelSource.actionDispatcher.dispatch(UpdateModelAction.create(layoutResult));
            }
        }
        else console.log('NO LAYOUT ENGINE!!!!! ', this.layoutEngine)
    }

    accepts(action: Action): boolean {
        return action.kind === shared.UPDATE_LAYOUT_ACTION_KIND;
    }
}
