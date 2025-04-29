import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClientConfigSingleton } from './langclientconfig.js';
import { getCurrentLayout, setCurrentLayout, UPDATE_LAYOUT_ACTION_KIND, UpdateLayoutAction } from '../../shared/utils.js';
import { createAuroraServices } from '../language/aurora-module.js';
import { NodeFileSystem } from 'langium/node';

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    console.log("Hello Aurora Activation...")
    // Register the focus command
    context.subscriptions.push(
        vscode.commands.registerCommand('aurora.focus', () => {
            // Handle focus action
            console.log('Aurora focus command executed');
        })
    );
    const langConfig = LanguageClientConfigSingleton.getInstance();
    langConfig.setServerModule(context.asAbsolutePath(path.join('dist', 'cjs/language', 'main.cjs'))); // Set serverModule
    langConfig.initialize(context);
    langConfig.registerWebviewViewProvider()

    vscode.workspace.onDidSaveTextDocument((d) => {
        langConfig.webviewProvider?.openDiagram(d.uri, { reveal: true }).then((o : any) =>{
                vscode.window.showTextDocument(d.uri, { preview: false });
            })
    })
    

    // var container: Container | undefined = auroraSprottyStarter.currentAuroraContainer
    // const modelSource = container?.get<LocalModelSource>(TYPES.ModelSource);
    
    // adding toggle command TO DO: consolidate all commands in a separate folder
        context.subscriptions.push(
            vscode.commands.registerCommand('aurora.diagram.toggleLayout', () => {
                let quickPick = vscode.window.createQuickPick();
                quickPick.placeholder = 'Choose a layout for your diagram...';
                let layoutOptions = ['Stress', 'Layered', 'MrTree'];
                quickPick.items = layoutOptions.map(x => { return { label: x }; });
                
                quickPick.onDidChangeSelection(selection => {
                    if (selection && selection.length > 0) {
                        setCurrentLayout(selection[0].label.toLowerCase())
                        console.log("From main: ",getCurrentLayout())
                        createAuroraServices(NodeFileSystem)
                    }
                });
                
                quickPick.show();
                
                quickPick.onDidAccept(() => {

                    const action: UpdateLayoutAction = {
                        kind: UPDATE_LAYOUT_ACTION_KIND,
                        layout: getCurrentLayout()
                    };

                    langConfig.webviewProvider?.findActiveWebview()?.sendAction(action);                  

                    quickPick.dispose();
                });
            })
        );
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    LanguageClientConfigSingleton.getInstance().stopClient()
    return undefined;
}
