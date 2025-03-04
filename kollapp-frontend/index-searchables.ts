import fs from 'node:fs';
import path from 'node:path';

import type { Expression } from 'estree';
import { parse, AST } from 'svelte/compiler';

import type { SearchableItem } from './src/lib/api/dto/server';

/**
 * Directory to scan and output file path.
 */
const SRC_DIR = 'src';
const OUTPUT_FILE = './static/data/searchables.json';

/**
 * Global array to store found items and a simple counter for ID assignment.
 */
const searchableItems: SearchableItem[] = [];
let idCounter = 0;

/**
 * Main entry point: scans the directory, processes Svelte files, and writes the output JSON.
 */
function indexSearchables(): void {
	scanDirectory(SRC_DIR);
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(searchableItems, undefined, 2), 'utf8');
	console.log(`\nWrote ${searchableItems.length} entries to ${OUTPUT_FILE}`);
}

/**
 * Recursively scans a directory for `.svelte` files.
 * Calls `scanSvelteFile` on each file found.
 */
function scanDirectory(directoryPath: string): void {
	const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(directoryPath, entry.name);
		if (entry.isDirectory()) {
			scanDirectory(fullPath);
		} else if (entry.isFile() && entry.name.endsWith('.svelte')) {
			scanSvelteFile(fullPath);
		}
	}
}

/**
 * Reads and parses a Svelte file to find `<LabeledItem>` components.
 */
function scanSvelteFile(filePath: string): void {
	const fileContent = fs.readFileSync(filePath, 'utf8');
	const ast = parse(fileContent, { modern: true });
	findSearchableComponents(ast);
}

/**
 * Represents the subset of Svelte AST node types we care about.
 */
type ASTComponent =
	| AST.Fragment
	| AST.Component
	| AST.IfBlock
	| AST.AwaitBlock
	| AST.RegularElement
	| AST.ExpressionTag;

/**
 * Examines the parsed AST for `<LabeledItem searchable={...} label={...} iconSrc={...}>` components,
 * and stores them in `searchableItems`.
 */
function findSearchableComponents(ast: AST.Root): void {
	recurse(ast.fragment);

	function recurse(node: ASTComponent): void {
		if (node.type === 'Component' && node.name === 'LabeledItem') {
			for (const attribute of node.attributes) {
				if (attribute.type === 'Attribute' && attribute.name === 'searchable') {
					const route = getAttributeValue(node, 'searchable');
					const label = getAttributeValue(node, 'label');
					const icon = getAttributeValue(node, 'iconSrc');

					if (label && route) {
						searchableItems.push({
							id: ++idCounter,
							label,
							icon,
							route
						});
					}
				}
			}
		}

		// Recursively explore child nodes
		switch (node.type) {
			case 'Fragment': {
				for (const child of node.nodes) {
					recurse(child as ASTComponent);
				}
				break;
			}
			case 'Component': {
				for (const child of node.fragment.nodes) {
					recurse(child as ASTComponent);
				}
				break;
			}
			case 'AwaitBlock': {
				for (const child of node.pending?.nodes ?? []) {
					recurse(child as ASTComponent);
				}
				for (const child of node.then?.nodes ?? []) {
					recurse(child as ASTComponent);
				}
				break;
			}
			case 'IfBlock': {
				for (const child of node.consequent.nodes) {
					recurse(child as ASTComponent);
				}
				for (const child of node.alternate?.nodes ?? []) {
					recurse(child as ASTComponent);
				}
				break;
			}
			case 'RegularElement': {
				for (const child of node.fragment.nodes) {
					recurse(child as ASTComponent);
				}
				break;
			}
		}
	}
}

/**
 * Returns the string value of a named attribute (e.g., 'searchable', 'label', 'iconSrc')
 * by inspecting the Svelte AST node.
 */
function getAttributeValue(node: ASTComponent, name: string): string | undefined {
	// Find the attribute on the node
	const attributeNode = (node as AST.Component).attributes.find(
		(attribute) => attribute.type === 'Attribute' && attribute.name === name
	) as AST.Attribute | undefined;

	// If the attribute or its value doesn't exist, return undefined
	const expressionTag = attributeNode?.value as AST.ExpressionTag | undefined;
	if (!expressionTag?.expression) {
		return;
	}

	let expression = expressionTag.expression as Expression;
	switch (expression.type) {
		case 'Literal': {
			return expression.value as string;
		}
		case 'Identifier': {
			return expression.name;
		}
		case 'CallExpression': {
			return expression.arguments.find((argument) => argument.type === 'Literal')?.value as string;
		}
		case 'MemberExpression': {
			const parts: string[] = [];
			while (expression.type === 'MemberExpression') {
				if (expression.property.type === 'Identifier') {
					parts.unshift(expression.property.name.replaceAll('_', '-').toLowerCase());
				}
				expression = expression.object as Expression;
			}

			// Handle the last piece if it's an Identifier
			if (expression.type === 'Identifier') {
				parts.unshift(expression.name.replaceAll('_', '-').toLowerCase());
			}

			parts.shift(); // Removes the "first" piece if not needed
			if (parts.at(-1) === 'root') {
				parts.pop();
			}
			return '/' + parts.join('/');
		}
		default: {
			return undefined;
		}
	}
}

// Execute the main function
indexSearchables();
