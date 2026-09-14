import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import { LanguageClient, TransportKind, State } from 'vscode-languageclient/node.js';

export class LanguageClientConfigSingleton {
    private static instance: LanguageClientConfigSingleton;
    private serverModule: string | undefined;
    private debugOptions: { execArgv: string[]; } | undefined;
    private serverOptions: ServerOptions | undefined;
    private clientOptions: LanguageClientOptions | undefined;
    private client: LanguageClient | undefined;
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



