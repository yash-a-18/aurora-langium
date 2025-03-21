#!/usr/bin/env node

import { evalAction } from '../dist/esm/src/cli/interpreter.js';
import { createAuroraServices } from '../dist/esm/src/language/aurora-module.js';
import { NodeFileSystem } from 'langium/node';
import fs from 'fs';

// Read the input file
const fileName = process.argv[2];
if (!fileName) {
    console.error('Please provide a file name as an argument.');
    process.exit(1);
}

// Read the file content
const fileContent = fs.readFileSync(fileName, 'utf-8');

// Create Langium services
const services = createAuroraServices(NodeFileSystem).Aurora;
// Tokenize the input file
const tokens = services.parser.Lexer.tokenize(fileContent);

// console.log('Tokens:', tokens.tokens.map(token => ({
//     type: token.tokenType.name,
//     text: token.image,
//     start: token.startOffset,
//     end: token.endOffset
// })));

// Execute the evalAction
// console.log('cli.js', fileName);
evalAction(fileName);