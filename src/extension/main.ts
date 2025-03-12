import * as vscode from 'vscode';
// import type * as vscode from 'vscode';


import { LanguageClientConfigSingleton } from './langclientconfig.js';


// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    console.log("Hello Arnold Activation...")
    // Register the focus command
    context.subscriptions.push(
        vscode.commands.registerCommand('aurora.focus', () => {
            // Handle focus action
            console.log('Aurora focus command executed');
        })
    );
    const langConfig = LanguageClientConfigSingleton.getInstance()
    langConfig.initialize(context)
    langConfig.registerWebviewViewProvider()


}


// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    LanguageClientConfigSingleton.getInstance().stopClient()
    return undefined;
}
