import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createAuroraServices } from './aurora-module.js';
import { addDiagramHandler, type LangiumSprottySharedServices } from 'langium-sprotty';

const connection = createConnection(ProposedFeatures.all);

connection.console.error = error => {
    console.error('Connection error:', error);
};

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    connection.console.error(`Uncaught exception: ${error.message}`);
});

try {
    const { shared } = createAuroraServices({ connection, ...NodeFileSystem });

    console.log('Starting language server...');
    startLanguageServer(shared);
    addDiagramHandler(connection, shared as LangiumSprottySharedServices);
    console.log('Language server started!!!!!!...');
} catch (error) {
    if (error instanceof Error) {
        console.error('Failed to start language server:', error);
        connection.console.error(`Failed to start language server: ${error.message}`);
    } else {
        console.error('Failed to start language server with unknown error:', error);
        connection.console.error('Failed to start language server with unknown error');
    }
}
