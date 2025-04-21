import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createAuroraServices } from './aurora-module.js';
import { addDiagramHandler } from 'langium-sprotty'

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Add error handling
connection.console.error = (error) => {
    console.error('Connection error:', error);
};

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    connection.console.error(`Uncaught exception: ${error.message}`);
});

try {
    // Inject the shared services and language-specific services
    const { shared } = createAuroraServices({ connection, ...NodeFileSystem });

    // Start the language server with the shared services
    console.log('Starting language server...');
    startLanguageServer(shared);
    console.log('Language server started!!!!!!...');
    addDiagramHandler(connection, shared);
} catch (error) {
    if (error instanceof Error) {
        console.error('Failed to start language server:', error);
        connection.console.error(`Failed to start language server: ${error.message}`);
    } else {
        console.error('Failed to start language server with unknown error:', error);
        connection.console.error('Failed to start language server with unknown error');
    }
}