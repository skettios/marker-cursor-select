import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log(context.storagePath);
	const markerDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			borderColor: 'darkblue'
		},
		dark: {
			borderColor: 'lightblue'
		}
	});

	const markers = new Map();

	vscode.commands.registerTextEditorCommand('extension.markerselect.dropMarker', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const cursorPos = editor.selection.active;
		if (!cursorPos) return;

		markers.set(editor, cursorPos);

		UpdateMarkerDecoration();
	});

	vscode.commands.registerTextEditorCommand('extension.markerselect.deleteToCursor', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const markerPos = markers.get(editor);
		if (!markerPos) return;

		let cursorPos = editor.selection.active;
		editor.edit((builder) => {
			builder.delete(new vscode.Range(markerPos, cursorPos))
		});
	});

	vscode.commands.registerTextEditorCommand('extension.markerselect.copyToCursor', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const marker = markers.get(editor);
		if (!marker) return;

		let cursor = editor.selection.active;
		let text = editor.document.getText(new vscode.Range(marker, cursor));
		vscode.env.clipboard.writeText(text);
	});

	vscode.commands.registerTextEditorCommand('extension.markerselect.cutToCursor', () => {
		vscode.commands.executeCommand('extension.markerselect.copyToCursor');
		vscode.commands.executeCommand('extension.markerselect.deleteToCursor');
	});

	vscode.commands.registerTextEditorCommand('extension.markerselect.swapWithCursor', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const marker: vscode.Position = markers.get(editor);
		if (!marker) return;

		vscode.commands.executeCommand('extension.markerselect.dropMarker');

		editor.selection = new vscode.Selection(marker, marker);
	});

	function UpdateMarkerDecoration() {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) return;

		const marker = markers.get(activeEditor);
		if (!marker) return;

		let beginPos = marker;
		let endPos = beginPos.translate(0, 1);
		let decoration: vscode.DecorationOptions[] = [];
		decoration.push({range: new vscode.Range(beginPos, endPos)});
		activeEditor.setDecorations(markerDecorationType, decoration);
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		UpdateMarkerDecoration();
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(editor => {
		UpdateMarkerDecoration();
	}, null, context.subscriptions);
}

export function deactivate() {}
