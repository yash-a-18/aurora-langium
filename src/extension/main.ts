import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClientConfigSingleton } from './langclientconfig.js';
import { toggleDiagramLayout } from './src/commands/toggle-diagram-layout-command.js';
import { createAuroraServices } from '../language/aurora-module.js';
import { NodeFileSystem } from 'langium/node';
import { parseFromText } from './src/parser/parser.js';
import { AstUtils } from 'langium';


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
        context.subscriptions.push(
            vscode.commands.registerCommand('aurora.diagram.toggleLayout', () => toggleDiagramLayout(langConfig))
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('diagram.revealSelectedElementRange', async (selectedElementID: string) => {
                console.log('hey we selected this element: ', selectedElementID)
                let activeEditor = vscode.window.activeTextEditor
                if(activeEditor) {
                    const text = activeEditor.document.getText()
                    const pcm = await parseFromText(createAuroraServices(NodeFileSystem).Aurora, text)
                    const selectedPCMNode = AstUtils.streamAllContents(pcm).toArray()
                                                    .filter(an => an.$cstNode?.text === selectedElementID[0])[0].$cstNode

                    if(selectedPCMNode) {
                        const startPos = activeEditor.document.positionAt(selectedPCMNode.offset);
                        const endPos = activeEditor.document.positionAt(selectedPCMNode.offset + selectedPCMNode.length);

                        const range = new vscode.Range(startPos, endPos);
                        highlightRange(range);
                    }
                    
                }                
            })
        );

        
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    LanguageClientConfigSingleton.getInstance().stopClient()
    return undefined;
}


export function highlightRange(range: vscode.Range) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }

    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255,215,0,0.3)' // light yellow
    });

    editor.setDecorations(decorationType, [range]);
}
