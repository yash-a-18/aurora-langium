import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import { LspSprottyViewProvider } from 'sprotty-vscode/lib/lsp/lsp-sprotty-view-provider.js';
import * as vscode from 'vscode';
import { Messenger } from 'vscode-messenger';
import * as path from 'node:path';
import { LanguageClient, TransportKind, State } from 'vscode-languageclient/node.js';
import { createFileUri, createWebviewHtml as doCreateWebviewHtml } from 'sprotty-vscode';
import {  registerDefaultCommands, registerTextEditorSync } from 'sprotty-vscode';



export class LanguageClientConfigSingleton {
    private static instance: LanguageClientConfigSingleton;
    private constructor() {
    }

    public static getInstance(): LanguageClientConfigSingleton {
        if(this.instance === undefined) {
            this.instance = new LanguageClientConfigSingleton();
        }
        return this.instance
    }

    public serverModule: string | undefined;
    public debugOptions: { execArgv: string[]; } | undefined;
    public serverOptions: ServerOptions | undefined;
    public clientOptions: LanguageClientOptions | undefined;
    public client: LanguageClient | undefined;
    private webviewViewProvider: LspSprottyViewProvider | undefined;

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
    
    private context: vscode.ExtensionContext | undefined;

    initialize(context: vscode.ExtensionContext) {
        const absolutelanguageserverpath = "c:\\dev\\projects\\LANGIUMSJS\\aurora-langium\\dist\\cjs\\language\\main.cjs"
        const languageserverpath1 = context.asAbsolutePath(path.join('dist', 'cjs/language', 'main.cjs'));
        console.log("constructed path" + languageserverpath1)
        this.context = context;
        this.serverModule =   absolutelanguageserverpath
        

        console.log('****************Server module:', this.serverModule);
        this.debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

        this.serverOptions = {
            run: { module: this.serverModule, transport: TransportKind.ipc },
            debug: { module: this.serverModule, transport: TransportKind.ipc, options: this.debugOptions }
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
        
        this.startClient()
    }

    public registerWebviewViewProvider(): void {
        // Register the focus command
        const wvp = this.webviewProvider!
        this.context?.subscriptions.push(
             vscode.window.registerWebviewViewProvider('aurora', wvp, {
                        webviewOptions: { retainContextWhenHidden: true }
            })
        );

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
            console.error('************Failed to create language client:', error);
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

