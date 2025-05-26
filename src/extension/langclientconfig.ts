import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import { LspSprottyViewProvider } from 'sprotty-vscode/lib/lsp/lsp-sprotty-view-provider.js';
import * as vscode from 'vscode';
import { Messenger } from 'vscode-messenger';
import { LanguageClient, TransportKind, State } from 'vscode-languageclient/node.js';
import { createFileUri, createWebviewHtml as doCreateWebviewHtml } from 'sprotty-vscode';
import {  registerDefaultCommands, registerTextEditorSync } from 'sprotty-vscode';
import { ElementSelectedNotification } from '../../shared/utils.js';
import { revealElementRange } from './src/commands/element-selected-command.js';

export class LanguageClientConfigSingleton {
    private static instance: LanguageClientConfigSingleton;
    private serverModule: string | undefined;
    private debugOptions: { execArgv: string[]; } | undefined;
    private serverOptions: ServerOptions | undefined;
    private clientOptions: LanguageClientOptions | undefined;
    private client: LanguageClient | undefined;
    private webviewViewProvider: LspSprottyViewProvider | undefined;
    private context: vscode.ExtensionContext | undefined;

    private constructor() {
    }

    public static getInstance(): LanguageClientConfigSingleton {
        if(this.instance === undefined) {
            this.instance = new LanguageClientConfigSingleton();
        }
        return this.instance
    }

    public getServerModule(): string | undefined {
        return this.serverModule;
    }

    public setServerModule(module: string): void {
        this.serverModule = module;
    }

    get webviewProvider(): LspSprottyViewProvider | undefined { 
        if(this.webviewViewProvider === undefined) {
            this.webviewViewProvider =  new CustomLspSprottyViewProvider({
                    extensionUri: this.context?.extensionUri!,
                    viewType: 'aurora',
                    languageClient: LanguageClientConfigSingleton.getInstance().client!,
                    supportedFileExtensions: ['.aurora'],
                    openActiveEditor: true,
                    messenger: new Messenger({ignoreHiddenViews: false}),
                })
            }     
        
        return this.webviewViewProvider
    }

    public get clientInstance(): LanguageClient | undefined {
        return this.client;
    }

    initialize(context: vscode.ExtensionContext) {
        this.context = context;

        console.log('Server module:', this.getServerModule());
        this.debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

        this.serverOptions = {
            run: { module: this.getServerModule()!, transport: TransportKind.ipc },
            debug: { module: this.getServerModule()!, transport: TransportKind.ipc, options: this.debugOptions }
        };
        
        this.clientOptions = {
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
        this.startClient();
    }

    public registerWebviewViewProvider(): void {
        // Register the focus command
        const wvp = this.webviewProvider!
        this.context?.subscriptions.push(
             vscode.window.registerWebviewViewProvider('aurora', wvp, {
                        webviewOptions: { retainContextWhenHidden: true }
            })
        );

        // This is where we can receive messages from aurora-webview (in the form of notifications)
        // TODO: formalize this so we can add more (maybe add a function that handles all of them)
        this.webviewProvider?.messenger.onNotification(ElementSelectedNotification, message => {
            revealElementRange(message.elementID)
        })

        registerDefaultCommands(wvp, this.context!, { extensionPrefix: 'aurora' });
        registerTextEditorSync(wvp, this.context!);
    }

      
    private startClient(): void {
        var newClient:LanguageClient| undefined
        try {
            newClient = new LanguageClient(
                'aurora',
                'Aurora',
                this.serverOptions!,
                this.clientOptions!
            );
        }
        catch (error) {
            console.error('Failed to create language client:', error);
        }
        
        this.client = newClient

        // Start the client. This will also launch the server
        // Add error handling
        this.client?.start().catch(error => {
            console.error('Failed to start language client:', error);
            vscode.window.showErrorMessage(`Failed to start Aurora language server: ${error.message}`);
        });
    
        // Add shutdown handling
        this.context?.subscriptions.push(
            this.client!.onDidChangeState(event => {
                if (event.newState === State.Stopped) {
                    console.log('Language server stopped');
                }
            })
        );

    }

    public stopClient(): void {
        if (this.client) {
            this.client.stop();
        }
        this.client = undefined;
    }
}

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

