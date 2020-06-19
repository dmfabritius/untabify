import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "untabify" is now active!');

	let disposable_untabify = vscode.commands.registerCommand('untabify.untabify', Untabify);
	context.subscriptions.push(disposable_untabify);

	let disposable_tabify = vscode.commands.registerCommand('untabify.tabify', Tabify);
	context.subscriptions.push(disposable_tabify);
}

export function deactivate() { }

/*
*/
function Untabify() {
	const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (!editor) { return; }
	if (editor.selection.isEmpty) {
		editor.selection = new vscode.Selection(
			editor.document.positionAt(0),
			editor.document.positionAt(editor.document.getText().length - 1));
	}
	const text: string = editor.document.getText(editor.selection);

	const lines: Array<string> = text.split('\n');
	const result: Array<string> = [];
	const widths: Array<number> = [];

	let pos: number = 0;
	let prev: number = 0;

	// create an entry in the list of column widths for each tab character
	while ((pos = lines[0].indexOf('\t', pos + 1)) !== -1) { widths.push(0); }

	// loop thru all the lines and determine the maximum width of each tab-separated column
	for (let line of lines) {
		pos = 0;
		prev = 0;
		for (let i = 0; i < widths.length; i++) {
			pos = line.indexOf('\t', prev);
			if (pos - prev > widths[i]) { widths[i] = pos - prev; }
			prev = pos + 1;
			if (prev >= line.length) { break; }
		}
	}

	// loop thru all the lines and replace each tab character with the appropriate number of spaces
	let extraSpaces: number | undefined = vscode.workspace.getConfiguration("untabify").get("extraSpaces");
	if (!extraSpaces) { extraSpaces = 3; }
	for (let line of lines) {
		prev = 0;
		for (let i = 0; i < widths.length; i++) {
			pos = line.indexOf('\t');
			if (pos === -1) { break; }
			prev = prev + widths[i] + extraSpaces;
			line = line.substring(0, pos) + " ".repeat(prev - pos) + line.substring(pos + 1);
		}
		result.push(line);
	}

	editor.edit(edit => edit.replace(editor.selection, result.join('\n')));
	editor.selection = new vscode.Selection(editor.document.positionAt(0), editor.document.positionAt(0));
}

/*
*/
function Tabify() {
	const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (!editor) { return; }
	if (editor.selection.isEmpty) {
		editor.selection = new vscode.Selection(
			editor.document.positionAt(0),
			editor.document.positionAt(editor.document.getText().length - 1));
	}
	const text: string = editor.document.getText(editor.selection);

	let minimumSpaces: number | undefined = vscode.workspace.getConfiguration("untabify").get("minimumSpaces");
	if (!minimumSpaces) { minimumSpaces = 3; }
	const spaces: string = " ".repeat(minimumSpaces);

	const re: RegExp = new RegExp(`${spaces}[ ]*`, "g");
	const result: string = text.replace(re, "\t");

	editor.edit(edit => edit.replace(editor.selection, result));
}
