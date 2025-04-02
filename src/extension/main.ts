import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClientConfigSingleton } from './langclientconfig.js';
import { diagramOptions } from '../language/aurora-module.js';


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
    
    // adding toggle command TO DO: consolidate all commands in a separate folder
        context.subscriptions.push(
            vscode.commands.registerCommand('aurora.diagram.toggleLayout', () => {
                let quickPick = vscode.window.createQuickPick();
                quickPick.placeholder = 'Choose a layout for your diagram...';
                let layoutOptions = ['Stress', 'Layered', 'MrTree'];
                quickPick.items = layoutOptions.map(x => { return { label: x }; });
                
                quickPick.onDidChangeSelection(selection => {
                    if (selection && selection.length > 0) {
                        diagramOptions.layout = selection[0].label.toLowerCase();
                    }
                });
                
                quickPick.show();
                
                quickPick.onDidAccept(() => {
                    console.log('new diagram layout: ' + diagramOptions.layout)
                    let activeTextEditor = vscode.window.activeTextEditor
                    if(activeTextEditor) {
                        let d = activeTextEditor.document
                        langConfig.webviewProvider?.openDiagram(d.uri, { reveal: true }).then((o : any) =>{
                            vscode.window.showTextDocument(d.uri, { preview: false });
                        })
                    }

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
