import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClientConfigSingleton } from './langclientconfig.js';
import { toggleDiagramLayout } from './src/commands/toggle-diagram-layout-command.js';
import { createAuroraServices } from '../language/aurora-module.js';
import { NodeFileSystem } from 'langium/node';
import { parseFromText } from './src/parser/parser.js';
// import { hideNarratives } from './src/commands/hide-narratives-command.js';
import { hideNGOs } from './src/commands/hide-ngos-command.js';
import WebSocket from 'ws';
import { insertNarrative } from './insertMCPNarratives.js';

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

    const socket = new WebSocket('ws://localhost:3001');

    socket.addEventListener('open', () => {
    console.log('✅ Connected to MCP Server');
    });

    socket.addEventListener('message', (event) => {
        // If event.data is a Buffer, convert to string
        const jsonString = typeof event.data === 'string'
            ? event.data
            : event.data.toString('utf-8');
        const mcp = JSON.parse(jsonString);

        if (mcp.action === 'insert_narrative') {
            console.log('Received insert_narrative action:', mcp.payload);
            insertNarrative(mcp.payload.text, mcp.payload.type, mcp.payload.line_number);
        }
    });


    vscode.workspace.onDidSaveTextDocument((d) => {
        langConfig.webviewProvider?.openDiagram(d.uri, { reveal: true }).then((o : any) =>{
                vscode.window.showTextDocument(d.uri, { preview: false });
            })
    })
        context.subscriptions.push(
            vscode.commands.registerCommand('aurora.diagram.toggleLayout', () => toggleDiagramLayout(langConfig))
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('filter.test', async () => {
                const activeEditor = vscode.window.activeTextEditor
                if(activeEditor) {
                    const pcm = await parseFromText(createAuroraServices(NodeFileSystem).Aurora, 
                                              activeEditor.document.getText())
                    hideNGOs(pcm, langConfig)
                }                
            })
        )
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    LanguageClientConfigSingleton.getInstance().stopClient()
    return undefined;
}
