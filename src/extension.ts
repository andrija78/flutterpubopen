// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { O_NOFOLLOW } from 'constants';

const yaml = require('js-yaml');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const pubspecPackages=(text: String) => {
		const doc=yaml.safeLoad(text);
		let packages=[];
		for (let pkg in doc.dependencies) {
			if (pkg!=='flutter' && pkg!=='cupertino_icons') {
				packages.push(pkg);
			}
		}
		
		for (let pkg in doc.dev_dependencies) {
			if (pkg!=='flutter_test') {
				packages.push(pkg);
			}
		}

		return packages;
	};

	const openFile=(clickedFile: vscode.Uri, uriType: String) => {
		vscode.workspace.openTextDocument(clickedFile).then((document) => {
			let packages=pubspecPackages(document.getText());
			for (let i=0;i<packages.length;i++) {
				let uri:vscode.Uri;

				if (uriType==='package') {
					uri=vscode.Uri.parse('https://pub.dev/packages/' + packages[i]);
				} else {
					uri=vscode.Uri.parse('https://pub.dev/documentation/' + packages[i] + '/latest');
				}
				vscode.env.openExternal(uri);
			}
		});
	};

	const openSelection=async (uriType: String) => {
		var editor = vscode.window.activeTextEditor;
		if (!editor) {return;} // No open text editor
		
		var selectedText:String;
		selectedText = editor.document.getText(editor.selection);
		if (selectedText==='') {
			await vscode.commands.executeCommand('editor.action.smartSelect.expand');
			selectedText = editor.document.getText(editor.selection);
			//selectedText=await vscode.commands.executeCommand('editor.action.addSelectionToNextFindMatch') || '';
		}
		
		var doc = editor.document.getText();
		let packages=pubspecPackages(doc);
		
		if (packages.filter((element) => element===selectedText).length>0) {
			let uri;
			if (uriType==='package') {
				uri=vscode.Uri.parse('https://pub.dev/packages/' + selectedText);
			} else {
				uri=vscode.Uri.parse('https://pub.dev/documentation/' + selectedText + '/latest');
			}
			vscode.env.openExternal(uri);
		} 
	};

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flutterpubopen" is now active!');
	
	context.subscriptions.push(...[

		vscode.commands.registerCommand(
			'flutterpubopen.openPubLinks',
			async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
				openFile(clickedFile, 'package');
			}),
		
			vscode.commands.registerCommand(
			'flutterpubopen.openPubApiLinks',
			async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
				openFile(clickedFile, 'api');
			}),
		
			vscode.commands.registerCommand('flutterpubopen.openPubLinksFromEditor', async (clickedFile: vscode.Uri) => {
				openSelection('package');

			}),

			vscode.commands.registerCommand('flutterpubopen.openPubApiLinksFromEditor', () => {
				openSelection('api');
			}),

	]);
}

// this method is called when your extension is deactivated
export function deactivate() { }
