"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const assert = __importStar(require("assert"));
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Valid JSON strings', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const diagnostics = yield validateJsonString(jsonString);
            assert.strictEqual(diagnostics.length, 0, `Expected no errors for valid JSON: ${jsonString}`);
        }
    }));
    test('Invalid JSON strings', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const diagnostics = yield validateJsonString(jsonString);
            assert.notStrictEqual(diagnostics.length, 0, `Expected errors for invalid JSON: ${jsonString}`);
        }
    }));
});
function validateJsonString(jsonString) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = yield vscode.workspace.openTextDocument({ content: jsonString, language: 'go' });
        const diagnostics = [];
        const jsonRegex = /"(?:\\.|[^"\\])*"|\`(?:\\.|[^\\`])*`/g;
        let match;
        while ((match = jsonRegex.exec(document.getText())) !== null) {
            const jsonString = match[0];
            let parsedJsonString = jsonString;
            if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                parsedJsonString = jsonString.slice(1, -1).replace(/\\"/g, '"');
            }
            else if (jsonString.startsWith('`') && jsonString.endsWith('`')) {
                parsedJsonString = jsonString.slice(1, -1);
            }
            if (/^\s*[\{\[]/.test(parsedJsonString)) {
                try {
                    JSON.parse(parsedJsonString);
                }
                catch (error) {
                    const startPos = document.positionAt(match.index);
                    const errorMessage = error.message;
                    const errorLineMatch = errorMessage.match(/at position (\d+)/);
                    if (errorLineMatch) {
                        const errorPosition = parseInt(errorLineMatch[1], 10);
                        const errorStartPos = document.positionAt(match.index + 1 + errorPosition);
                        const errorEndPos = document.positionAt(match.index + 1 + errorPosition + 1);
                        const errorRange = new vscode.Range(errorStartPos, errorEndPos);
                        const diagnosticMessage = `Invalid JSON at position ${errorPosition}`;
                        const diagnostic = new vscode.Diagnostic(errorRange, diagnosticMessage, vscode.DiagnosticSeverity.Error);
                        diagnostics.push(diagnostic);
                    }
                    else {
                        const range = new vscode.Range(startPos, document.positionAt(match.index + match[0].length));
                        const diagnostic = new vscode.Diagnostic(range, 'Invalid JSON', vscode.DiagnosticSeverity.Error);
                        diagnostics.push(diagnostic);
                    }
                }
            }
        }
        return diagnostics;
    });
}
//# sourceMappingURL=extension.test.js.map