import * as vscode from 'vscode';
import * as assert from 'assert';
import { activate } from '../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Valid JSON strings', async () => {
        const validJsonStrings = [
            "{\"name\": \"John Doe\", \"age\": 30, \"email\": \"johndoe@example.com\"}",
            `{
                "name": "John Doe",
                "age": 30,
                "email": "johndoe@example.com",
                "address": {
                    "street": "123 Main St",
                    "city": "New York",
                    "state": "NY"
                },
                "interests": [
                    "programming",
                    "reading",
                    "traveling"
                ]
            }`,
            `{"numbers": [1, 2, 3, 4, 5], "boolean": true, "nullValue": null}`,
            `{"nested": {"level1": {"level2": {"level3": "deep"}}}}`,
            `{"arrayOfObjects": [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]}`
        ];

        for (const jsonString of validJsonStrings) {
            const diagnostics = await validateJsonString(jsonString);
            assert.strictEqual(diagnostics.length, 0, `Expected no errors for valid JSON: ${jsonString}`);
        }
    });

    test('Invalid JSON strings', async () => {
        const invalidJsonStrings = [
            "{\"name\": \"John Doe\", \"age\": 30, \"email\": johndoe@example.com\"}",
            `{
                "name": "John Doe",
                "age": 30,
                "email": "johndoe@example.com",
                "address": {
                    "street": "123 Main St",
                    "city": "New York",
                    "state": "NY"
                "interests": [
                    "programming",
                    "reading",
                    "traveling"
                ]
            }`,
            `{"missingComma": "value1" "value2"}`,
            `{"unclosedBrace": {"key": "value"}`,
            `{"extraComma": ["item1", "item2",]}`
        ];

        for (const jsonString of invalidJsonStrings) {
            const diagnostics = await validateJsonString(jsonString);
            assert.notStrictEqual(diagnostics.length, 0, `Expected errors for invalid JSON: ${jsonString}`);
        }
    });
});

async function validateJsonString(jsonString: string): Promise<vscode.Diagnostic[]> {
    const document = await vscode.workspace.openTextDocument({ content: jsonString, language: 'go' });
    const diagnostics: vscode.Diagnostic[] = [];

    const jsonRegex = /"(?:\\.|[^"\\])*"|\`(?:\\.|[^\\`])*`/g;
    let match;
    while ((match = jsonRegex.exec(document.getText())) !== null) {
        const jsonString = match[0];
        let parsedJsonString = jsonString;

        if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
            parsedJsonString = jsonString.slice(1, -1).replace(/\\"/g, '"');
        } else if (jsonString.startsWith('`') && jsonString.endsWith('`')) {
            parsedJsonString = jsonString.slice(1, -1);
        }

        if (/^\s*[\{\[]/.test(parsedJsonString)) {
            try {
                JSON.parse(parsedJsonString);
            } catch (error) {
                const startPos = document.positionAt(match.index);
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

    return diagnostics;
}