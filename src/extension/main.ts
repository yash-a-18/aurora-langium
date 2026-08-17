import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClientConfigSingleton } from './langclientconfig.js';
import { toggleDiagramLayout } from './src/commands/toggle-diagram-layout-command.js';

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    console.log("Hello Aurora Activation...")
    
    // Register the focus command
    context.subscriptions.push(
        vscode.commands.registerCommand('aurora.focus', () => {
            console.log('Aurora focus command executed');
        })
    );
    
    const langConfig = LanguageClientConfigSingleton.getInstance();
    langConfig.setServerModule(context.asAbsolutePath(path.join('dist', 'cjs/language', 'main.cjs')));
    langConfig.initialize(context, context.asAbsolutePath(path.join('dist', 'cjs/language', 'main.cjs')));
    
    // Sprotty webview registration removed. 
    // Document save handling is now managed by your Scala extension.scala.

    context.subscriptions.push(
        vscode.commands.registerCommand('aurora.diagram.toggleLayout', () => toggleDiagramLayout(langConfig))
    );
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    LanguageClientConfigSingleton.getInstance().stopClient();
    return undefined;
}