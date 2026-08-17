import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import { LanguageClient, TransportKind, State } from 'vscode-languageclient/node.js';

export class LanguageClientConfigSingleton {
    private static instance: LanguageClientConfigSingleton;
    
    // We only need the core LSP properties now. No more Sprotty!
    private serverModule: string | undefined;
    private clientOptions: LanguageClientOptions | undefined;
    private client: LanguageClient | undefined;
    private context: vscode.ExtensionContext | undefined;

    private constructor() {}

    public static getInstance(): LanguageClientConfigSingleton {
        if (!LanguageClientConfigSingleton.instance) {
            LanguageClientConfigSingleton.instance = new LanguageClientConfigSingleton();
        }
        return LanguageClientConfigSingleton.instance;
    }

    public setServerModule(modulePath: string): void {
        this.serverModule = modulePath;
    }

    public getServerModule(): string | undefined {
        return this.serverModule;
    }

    public initialize(context: vscode.ExtensionContext, serverModulePath: string): void {
        this.context = context;
        this.serverModule = serverModulePath;
        
        // Safety check to ensure Scala provided the module path
        if (!this.serverModule) {
            console.error("Server module path is undefined. Cannot start Aurora language server.");
            return;
        }

        // Construct serverOptions dynamically here!
        // Because we do this here, this.serverModule is guaranteed to be populated.
        const serverOptions: ServerOptions = {
            run: { 
                module: this.serverModule, 
                transport: TransportKind.ipc 
            },
            debug: { 
                module: this.serverModule, 
                transport: TransportKind.ipc, 
                options: { execArgv: ["--nolazy", "--inspect=6009"] } 
            }
        };

        // Define the capabilities of the Language Client
        this.clientOptions = {
            documentSelector: [{ scheme: 'file', language: 'aurora' }],
            synchronize: {
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.aurora')
            }
        };

        // Create and start the Language Client
        this.client = new LanguageClient(
            'auroraLanguageServer',
            'Aurora Language Server',
            serverOptions,
            this.clientOptions
        );

        this.client.start().catch(error => {
            console.error('Failed to start language client:', error);
            vscode.window.showErrorMessage(`Failed to start Aurora language server: ${error.message}`);
        });

        // Add shutdown handling
        this.context.subscriptions.push(
            this.client.onDidChangeState(event => {
                if (event.newState === State.Stopped) {
                    console.log('Aurora Language server stopped.');
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