import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('goJsonValidator');

  const validateJson = (document: vscode.TextDocument) => {
    if (document.languageId !== 'go') {
      return;
    }

    const text = document.getText();
    const diagnostics: vscode.Diagnostic[] = [];

    // Updated regex to match JSON objects or arrays within double quotes or backticks
    const jsonRegex = /"(?:\\.|[^"\\])*"|\`(?:\\.|[^\\`])*`/g;
    let match;
    while ((match = jsonRegex.exec(text)) !== null) {
      const jsonString = match[0];
      let parsedJsonString = jsonString;

      // Remove enclosing quotes or backticks
      if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
        parsedJsonString = jsonString.slice(1, -1).replace(/\\"/g, '"');
      } else if (jsonString.startsWith('`') && jsonString.endsWith('`')) {
        parsedJsonString = jsonString.slice(1, -1);
      }

      // Check if the string is a valid JSON object or array
      if (/^\s*[\{\[]/.test(parsedJsonString)) {
        try {
          JSON.parse(parsedJsonString);
        } catch (error) {
          const startPos = document.positionAt(match.index);
          // Extract error position from error message
          const errorMessage = (error as Error).message;
          const errorLineMatch = errorMessage.match(/at position (\d+)/);

          if (errorLineMatch) {
            const errorPosition = parseInt(errorLineMatch[1], 10);

            const errorStartPos = document.positionAt(match.index + 1 + errorPosition);
            const errorEndPos = document.positionAt(match.index + 1 + errorPosition + 1);
            const errorRange = new vscode.Range(errorStartPos, errorEndPos);

            const diagnosticMessage = `Invalid JSON at position ${errorPosition}`;
            const diagnostic = new vscode.Diagnostic(errorRange, diagnosticMessage, vscode.DiagnosticSeverity.Error);
            diagnostics.push(diagnostic);
          } else {
            const range = new vscode.Range(startPos, document.positionAt(match.index + match[0].length));
            const diagnostic = new vscode.Diagnostic(range, 'Invalid JSON', vscode.DiagnosticSeverity.Error);
            diagnostics.push(diagnostic);
          }
        }
      }
    }

    diagnosticCollection.set(document.uri, diagnostics);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('go-json-validator.validate', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        validateJson(editor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      validateJson(document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      validateJson(event.document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      validateJson(document);
    })
  );

  // Validate all open documents when the extension is activated
  vscode.workspace.textDocuments.forEach((document) => {
    validateJson(document);
  });

  context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {}