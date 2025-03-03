import fs from 'node:fs';
import path from 'node:path';

import { Expression } from 'estree';
import { AST, parse } from 'svelte/compiler';
import { v7 } from 'uuid';

import { SearchableItem } from './src/lib/api/dto/server';

const SRC_DIR = 'src';
const OUTPUT_FILE = './static/data/searchables.json';

const result: SearchableItem[] = [];

function indexSearchables() {
	scanDirectory(SRC_DIR);
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result), 'utf8');
	console.log(`\nWrote ${result.length} entries to ${OUTPUT_FILE}`);
}

function scanDirectory(directoryPath: string) {
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

function scanSvelteFile(filePath: string) {
	const fileContent = fs.readFileSync(filePath, 'utf8');
	const ast = parse(fileContent, { modern: true });
	findSearchableComponents(ast);
}

type ASTComponent =
	| AST.Fragment
	| AST.Component
	| AST.IfBlock
	| AST.AwaitBlock
	| AST.RegularElement
	| AST.ExpressionTag;

function getAttributeValue(node: ASTComponent, name: string): string | undefined {
	let expression = (
		(
			(node as AST.Component).attributes.find(
				(attribute) => attribute.type === 'Attribute' && attribute.name === name
			) as AST.Attribute
		)?.value as AST.ExpressionTag
	)?.expression;
	if (!expression) {
		return;
	}
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

			if (expression.type === 'Identifier') {
				parts.unshift(expression.name.replaceAll('_', '-').toLowerCase());
			}
			parts.shift();
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

function findSearchableComponents(ast: AST.Root) {
	recurse(ast.fragment);

	function recurse(node: ASTComponent) {
		if (node.type === 'Component' && node.name === 'LabeledItem') {
			for (const attribute of node.attributes) {
				if (attribute.type === 'Attribute' && attribute.name === 'searchable') {
					const route = getAttributeValue(node, 'searchable');
					const label = getAttributeValue(node, 'label');
					const icon = getAttributeValue(node, 'iconSrc');
					if (label && route) {
						result.push({ id: v7(), label, icon, route });
					}
				}
			}
		}

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

	return result;
}

indexSearchables();
