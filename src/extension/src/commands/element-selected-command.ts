import { AstNode, AstUtils } from 'langium'
import * as vscode from 'vscode'
import { createAuroraServices } from '../../../language/aurora-module.js'
import { NodeFileSystem } from 'langium/node'
import { parseFromText } from '../parser/parser.js'
import { isNL_STATEMENT, isOrderCoordinate } from '../../../language/generated/ast.js'

export async function revealElementRange(selectedElementID: string) {
let activeEditor = vscode.window.activeTextEditor
                if(activeEditor) {
                    const text = activeEditor.document.getText()
                    const pcm = await parseFromText(createAuroraServices(NodeFileSystem).Aurora, text)
                    const castNodes = AstUtils.streamAllContents(pcm).toArray().reduce((astMap, an) => {
                                            if (isOrderCoordinate(an) || isNL_STATEMENT(an)) {
                                                astMap.set(an.name, an);
                                            }
                                            return astMap;
                                        }, new Map<string, AstNode>());
                    const selectedNode = castNodes.get(selectedElementID)
                    const selectedCst = selectedNode?.$cstNode

                    if(selectedCst) {
                        const startPosition = activeEditor.document.positionAt(selectedCst.offset);
                        const endPosition = activeEditor.document.positionAt(selectedCst.offset + selectedElementID.length);
                        const range = new vscode.Range(startPosition, endPosition);
                        highlightRange(range);
                    }
                    
                } 
}

let currentDecoration: vscode.TextEditorDecorationType | null = null;

function highlightRange(range: vscode.Range) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }

    // Clear previous highlight
    if (currentDecoration) {
        editor.setDecorations(currentDecoration, []); // removes old highlight from the editor
        currentDecoration.dispose();
        currentDecoration = null;
    }

    // Create a new decoration for the new range
    currentDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255,215,0,0.3)'
    });

    // Apply the new decoration
    editor.setDecorations(currentDecoration, [range]);
}
