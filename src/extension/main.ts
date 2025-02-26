import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
// import type * as vscode from 'vscode';
import * as path from 'node:path';
import { State, LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { createFileUri, createWebviewHtml as doCreateWebviewHtml,
    registerDefaultCommands, registerTextEditorSync
 } from 'sprotty-vscode';
import { LspSprottyViewProvider } from 'sprotty-vscode/lib/lsp/lsp-sprotty-view-provider.js';
import { Messenger } from 'vscode-messenger';

let client: LanguageClient;

class CustomLspSprottyViewProvider extends LspSprottyViewProvider {
    protected createWebview(container: vscode.WebviewView): void {
        const webview = container.webview;
        const localResourceRoots = [createFileUri(this.options.extensionUri.fsPath, 'pack', 'diagram')];
        webview.options = {
            enableScripts: true,
            localResourceRoots
        };
        const identifier = { clientId: 'aurora', diagramType: 'aurora', uri: 'aurora' };
        webview.html = doCreateWebviewHtml(identifier, container, {
            scriptUri: createFileUri(this.options.extensionUri.fsPath, 'pack', 'diagram', 'main.js'),
            cssUri: createFileUri(this.options.extensionUri.fsPath, 'pack', 'diagram', 'main.css')
        });
    }
}

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    console.log("Hello Activation...")
    client = startLanguageClient(context);
    // const extensionPath = context.extensionUri.fsPath;
    // const localResourceRoots = [createFileUri(extensionPath, 'pack', 'diagram')];
    // const createWebviewHtml = (identifier: SprottyDiagramIdentifier, container: WebviewContainer) => doCreateWebviewHtml(identifier, container, {
    //     scriptUri: createFileUri(extensionPath, 'pack', 'diagram', 'main.js'),
    //     cssUri: createFileUri(extensionPath, 'pack', 'diagram', 'main.css')
    // });
    // Register the focus command
    context.subscriptions.push(
        vscode.commands.registerCommand('aurora.focus', () => {
            // Handle focus action
            console.log('Aurora focus command executed');
        })
    );

    // Set up webview view shown in the side panel
    const webviewViewProvider = new CustomLspSprottyViewProvider({
        extensionUri: context.extensionUri,
        viewType: 'aurora',
        languageClient: client,
        supportedFileExtensions: ['.aurora'],
        openActiveEditor: true,
        messenger: new Messenger({ignoreHiddenViews: false}),
    });
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('aurora', webviewViewProvider, {
            webviewOptions: { retainContextWhenHidden: true }
        })
    );
    registerDefaultCommands(webviewViewProvider, context, { extensionPrefix: 'aurora' });
    registerTextEditorSync(webviewViewProvider, context);
}


// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'aurora' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.aurora')
        },
        outputChannel: vscode.window.createOutputChannel('Aurora Language Server'),
        initializationFailedHandler: (error) => {
            console.error('Language server initialization failed:', error);
            return false;
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'aurora',
        'Aurora',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    // Add error handling
    client.start().catch(error => {
        console.error('Failed to start language client:', error);
        vscode.window.showErrorMessage(`Failed to start Aurora language server: ${error.message}`);
    });

    // Add shutdown handling
    context.subscriptions.push(
        client.onDidChangeState(event => {
            if (event.newState === State.Stopped) {
                console.log('Language server stopped');
            }
        })
    );
    return client;
}
