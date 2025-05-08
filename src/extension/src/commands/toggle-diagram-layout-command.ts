import * as vscode from 'vscode'
import { getCurrentLayout, setCurrentLayout, UPDATE_LAYOUT_ACTION_KIND, UpdateLayoutAction } from '../../../../shared/utils.js';
import { LanguageClientConfigSingleton } from '../../langclientconfig.js';


export function toggleDiagramLayout(langConfig: LanguageClientConfigSingleton) {
    let quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = 'Choose a layout for your diagram...';
                let layoutOptions = ['Stress', 'Layered', 'MrTree'];
                quickPick.items = layoutOptions.map(x => { return { label: x }; });
                
                quickPick.onDidChangeSelection(selection => {
                    if (selection && selection.length > 0) {
                        setCurrentLayout(selection[0].label.toLowerCase())
                    }
                });
                
                quickPick.show();
                
                quickPick.onDidAccept(() => {

                        const action: UpdateLayoutAction = {
                            kind: UPDATE_LAYOUT_ACTION_KIND,
                            layout: getCurrentLayout(),
                        };    
                        langConfig.webviewProvider?.findActiveWebview()?.sendAction(action);  
                                 

                    quickPick.dispose();
                });
}