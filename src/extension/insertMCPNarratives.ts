import * as vscode from 'vscode';

export async function insertNarrative(text: string, type: string, lineNumber: number) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found.');
    return;
  }

  const symbolMap: Record<string, string> = {
    normal: '--',
    urgent: '!!',
    draft: '??',
    'urgent completed': 'xx',
    'draft completed': '..'
  };

  const prefix = symbolMap[type] || '--';
  const sanitizedText = text.trim().replace(/;*$/, '') + ';'; // ensure 1 semicolon
  const finalLine = `${prefix} ${sanitizedText}`;

  const edit = new vscode.WorkspaceEdit();
  const position = new vscode.Position(lineNumber, 0);
  const uri = editor.document.uri;

  edit.insert(uri, position, finalLine + '\n');

  await vscode.workspace.applyEdit(edit);
  vscode.window.showInformationMessage(`Inserted: ${finalLine}`);
}
