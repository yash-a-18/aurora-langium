import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createAuroraServices } from './aurora-module.js';
import { addDiagramHandler } from 'langium-sprotty'

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createAuroraServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);
addDiagramHandler(connection, shared);
