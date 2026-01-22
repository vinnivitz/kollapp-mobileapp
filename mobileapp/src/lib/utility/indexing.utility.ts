import type { SearchableItemTO } from '$lib/api/dto';
import type { OrganizationRole } from '@kollapp/api-types';
import type { Expression, Identifier, MemberExpression } from 'estree';

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { type AST, parse } from 'svelte/compiler';

import type { RouteId } from '$app/types';

/**
 * Directory to scan and output file path.
 */
const SRC_DIR = './';
const OUTPUT_FILE = './static/data/searchables.json';
const ROLE_PREFIX = 'ROLE_ORGANIZATION_';

/**
 * Global array to store found items and a simple counter for ID assignment.
 */
const searchableItems: SearchableItemTO[] = [];
let idCounter = 0;

/**
 * Main entry point: scans the directory, processes Svelte files, and writes the output JSON.
 */
function indexSearchables(): void {
	scanDirectory(SRC_DIR);
	writeFileSync(OUTPUT_FILE, JSON.stringify(searchableItems, undefined, 2), 'utf8');
	console.info(`\nWrote ${searchableItems.length} entries to ${OUTPUT_FILE}`);
}

/**
 * Recursively scans a directory for `.svelte` files.
 * Calls `scanSvelteFile` on each file found.
 */
function scanDirectory(directoryPath: string): void {
	const entries = readdirSync(directoryPath, { withFileTypes: true });
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
	const fileContent = readFileSync(filePath, 'utf8');
	const ast = parse(fileContent, { modern: true });
	findSearchableComponents(ast);
}

/**
 * Represents the subset of Svelte AST node types we care about.
 */
type ASTComponent = AST.AwaitBlock | AST.Component | AST.Fragment | AST.IfBlock | AST.RegularElement | AST.SnippetBlock;

/**
 * Examines the parsed AST for `<LabeledItem indexed={...} label={...} icon={...}>` components,
 * and stores them in `searchableItems`.
 */
function findSearchableComponents(ast: AST.Root): void {
	recurse(ast.fragment);
}

function recurse(node: ASTComponent): void {
	if (node.type === 'Component') {
		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute' && attribute.name === 'indexed') {
				addSearchableItem(node);
			}
		}
	}

	exploreChildNodes(node);
}

function exploreChildNodes(node: ASTComponent): void {
	switch (node.type) {
		case 'SnippetBlock': {
			for (const child of node.body.nodes) {
				recurse(child as ASTComponent);
			}
			break;
		}
		case 'Fragment': {
			for (const child of node.nodes) {
				recurse(child as ASTComponent);
			}
			break;
		}
		case 'Component':
		case 'RegularElement': {
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
	}
}

function addSearchableItem(node: ASTComponent): void {
	const route = getAttributeValue(node, 'indexed') as RouteId;
	const label = getAttributeValue(node, 'label') ?? getAttributeValue(node, 'indexLabel');
	const icon = getAttributeValue(node, 'icon');
	const accessible = getAttributeValue(node, 'accessible') as OrganizationRole;

	if (label && route) {
		searchableItems.push({
			accessible,
			icon,
			id: ++idCounter,
			label,
			route
		});
	} else {
		console.warn('Skipping searchable item - missing label or route:', { label, route });
	}
}

/**
 * Returns the string value of a named attribute (e.g., 'indexed', 'label', 'icon')
 * by inspecting the Svelte AST node.
 */
function getAttributeValue(node: ASTComponent, name: string): string | undefined {
	// Find the attribute on the node
	const attributeNode = (node as AST.Component).attributes.find(
		(attribute) => attribute.type === 'Attribute' && attribute.name === name
	) as AST.Attribute | undefined;

	if (!attributeNode) {
		return;
	}

	// Check if it's a simple text value (for string literals like indexed="/account")
	if (attributeNode.value === true) {
		return name; // Boolean attribute
	}

	// If the value is a single ExpressionTag
	if (
		typeof attributeNode.value === 'object' &&
		!Array.isArray(attributeNode.value) &&
		'type' in attributeNode.value &&
		attributeNode.value.type === 'ExpressionTag'
	) {
		return parseExpression((attributeNode.value as AST.ExpressionTag).expression);
	}

	// Handle array of values (text + expressions, e.g., "text{expr}text")
	if (Array.isArray(attributeNode.value)) {
		// For simple string attributes, the value is an array with a single Text node
		const textNode = attributeNode.value.find((value) => value.type === 'Text');
		if (textNode && 'data' in textNode) {
			return textNode.data;
		}

		// If there's an ExpressionTag, process it
		const expressionTag = attributeNode.value.find((value) => value.type === 'ExpressionTag') as
			| AST.ExpressionTag
			| undefined;
		if (expressionTag?.expression) {
			return parseExpression(expressionTag.expression);
		}
	}
}

function parseExpression(expression: Expression): string | undefined {
	switch (expression.type) {
		case 'Literal': {
			return expression.value as string;
		}
		case 'Identifier': {
			return expression.name;
		}
		case 'CallExpression': {
			const firstArgument = expression.arguments[0];
			if (firstArgument && firstArgument.type === 'Literal') {
				return firstArgument.value as string;
			}
			return undefined;
		}
		case 'ArrayExpression': {
			return expression.elements
				.map((element) => `${ROLE_PREFIX}${((element as MemberExpression).property as Identifier).name}`)
				.join(',');
		}
		case 'MemberExpression': {
			const parts: string[] = [];
			let expr: Expression = expression;
			while (expr.type === 'MemberExpression') {
				if (expr.property.type === 'Identifier') {
					parts.unshift(expr.property.name.replaceAll('_', '-').toLowerCase());
				}
				expr = expr.object as Expression;
			}

			// Handle the last piece if it's an Identifier
			if (expr.type === 'Identifier') {
				parts.unshift(expr.name.replaceAll('_', '-').toLowerCase());
			}

			parts.shift(); // Removes the "first" piece if not needed
			if (parts.at(-1) === 'root') {
				parts.pop();
			}
			return '/' + parts.join('/');
		}
		default: {
			console.warn('Unhandled expression type:', expression.type, JSON.stringify(expression, undefined, 2));
			return undefined;
		}
	}
}

indexSearchables();
