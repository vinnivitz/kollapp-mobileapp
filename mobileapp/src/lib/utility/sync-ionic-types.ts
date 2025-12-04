/**
 * Synchronizes Ionic component types from @ionic/core to app.d.ts for Svelte
 *
 * This script:
 * 1. Reads LocalJSX namespace from @ionic/core/dist/types/components.d.ts
 * 2. Transforms property names to kebab-case (except events)
 * 3. Transforms event handlers (onEventName -> oneventName)
 * 4. Preserves JSDoc comments
 * 5. Generates svelteHTML namespace with IntrinsicElements
 * 6. Updates src/app.d.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IONIC_TYPES_PATH = path.resolve(__dirname, '../../../node_modules/@ionic/core/dist/types/components.d.ts');
const APP_D_TS_PATH = path.resolve(__dirname, '../../../src/app.d.ts');

// Convert camelCase to kebab-case
function toKebabCase(string_: string): string {
	return string_.replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Check if a property is an event handler
function isEventHandler(propertyName: string): boolean {
	return /^on[A-Z]/.test(propertyName);
}

// Transform event handler name: onIonChange -> onionChange
function transformEventHandler(propertyName: string): string {
	if (!isEventHandler(propertyName)) return propertyName;
	// Convert first letter after 'on' to lowercase
	return 'on' + propertyName.charAt(2).toLowerCase() + propertyName.slice(3);
}

// Transform property name based on type
function transformPropertyName(propertyName: string): string {
	if (isEventHandler(propertyName)) {
		return transformEventHandler(propertyName);
	}
	return toKebabCase(propertyName);
}

// Extract JSDoc comment and property definition
interface PropertyInfo {
	jsdoc: string;
	name: string;
	type: string;
	isOptional: boolean;
}

function parseInterfaceProperties(interfaceContent: string): PropertyInfo[] {
	const properties: PropertyInfo[] = [];
	const lines = interfaceContent.split('\n');

	let currentJsDocument: string[] = [];
	let inJsDocument = false;

	for (const line of lines) {
		const trimmedLine = line!.trim();

		// Track JSDoc comments
		if (trimmedLine.startsWith('/**')) {
			inJsDocument = true;
			currentJsDocument = [line!];
			continue;
		}

		if (inJsDocument) {
			currentJsDocument.push(line!);
			if (trimmedLine.endsWith('*/')) {
				inJsDocument = false;
			}
			continue;
		}

		// Match property definition: "propertyName"?: type;
		const propertyMatch = trimmedLine.match(/^["']?(\w+)["']?\??\s*:\s*(.+?);?\s*$/);

		if (propertyMatch && !trimmedLine.startsWith('interface') && !trimmedLine.startsWith('}')) {
			const propertyName = propertyMatch[1];
			let propertyType = propertyMatch[2]!.trim();

			// Remove trailing semicolon if present
			if (propertyType.endsWith(';')) {
				propertyType = propertyType.slice(0, -1).trim();
			}

			const isOptional = trimmedLine.includes('?:');

			properties.push({
				isOptional,
				jsdoc: currentJsDocument.join('\n'),
				name: propertyName!,
				type: propertyType
			});

			currentJsDocument = [];
		}
	}

	return properties;
}

// Extract all interfaces from LocalJSX namespace
function extractLocalJSXInterfaces(content: string): Map<string, PropertyInfo[]> {
	const interfaces = new Map<string, PropertyInfo[]>();

	// Find LocalJSX namespace
	const namespaceMatch = content.match(/declare namespace LocalJSX\s*\{([\s\S]*?)\n\}/m);
	if (!namespaceMatch) {
		throw new Error('Could not find LocalJSX namespace');
	}

	const namespaceContent = namespaceMatch[1];

	// Extract each interface with better regex
	const lines = namespaceContent!.split('\n');
	let currentInterface: string | undefined = undefined;
	let interfaceLines: string[] = [];
	let braceCount = 0;

	for (const line of lines) {
		if (/^\s{4}interface\s+(Ion[A-Za-z]+)\s*\{/.test(line)) {
			const match = line.match(/interface\s+(Ion[A-Za-z]+)/);
			if (match) {
				currentInterface = match[1]!;
				interfaceLines = [];
				braceCount = 1;
			}
			continue;
		}

		if (currentInterface) {
			// Count braces to track interface boundaries
			braceCount += (line.match(/\{/g) || []).length;
			braceCount -= (line.match(/\}/g) || []).length;

			if (braceCount === 0) {
				// Interface ended
				const properties = parseInterfaceProperties(interfaceLines.join('\n'));
				interfaces.set(currentInterface, properties);
				currentInterface = undefined;
				interfaceLines = [];
			} else {
				interfaceLines.push(line);
			}
		}
	}

	return interfaces;
}

// Extract all type exports we need from the interfaces
function extractRequiredTypes(interfaces: Map<string, PropertyInfo[]>): Set<string> {
	const types = new Set<string>();

	// First, collect all types that are actually referenced in the interfaces
	for (const [, properties] of interfaces) {
		for (const property of properties) {
			// Extract type names from property types
			// Match custom types (capitalized words that aren't built-in types)
			const typeMatches = property.type.matchAll(
				/\b([A-Z][a-zA-Z0-9]+(?:Detail|Button|Input|EventDetail|CustomEvent|Column|Options|Callback|Cycle|Presentation|Builder|Delegate|String|Event|Types)?)\b/g
			);
			for (const match of typeMatches) {
				const typeName = match[1];
				// Skip generic HTML/DOM types and built-in JavaScript types
				if (
					!typeName!.startsWith('HTML') &&
					typeName !== 'Animation' &&
					typeName !== 'Function' &&
					typeName !== 'CustomEvent' &&
					typeName !== 'Promise' &&
					typeName !== 'Record' &&
					typeName !== 'Element' &&
					typeName !== 'Event' &&
					typeName !== 'Node' &&
					typeName !== 'Error'
				) {
					types.add(typeName!);
				}
			}
		}
	}

	return types;
}

// Generate svelteHTML interface from properties
function generateInterface(interfaceName: string, properties: PropertyInfo[]): string {
	if (properties.length === 0) {
		return `\t\tinterface ${interfaceName} {}\n`;
	}

	let output = `\t\tinterface ${interfaceName} {\n`;

	for (const property of properties) {
		// Add JSDoc if present
		if (property.jsdoc) {
			const jsdocLines = property.jsdoc.split('\n');
			for (const line of jsdocLines) {
				output += `\t${line}\n`;
			}
		}

		// Transform property name
		const transformedName = transformPropertyName(property.name);
		const optional = property.isOptional ? '?' : '';

		// Handle property name with special characters (needs quotes)
		const needsQuotes = transformedName.includes('-');
		const propertyName = needsQuotes ? `'${transformedName}'` : transformedName;

		output += `\t\t\t${propertyName}${optional}: ${property.type};\n`;
	}

	output += `\t\t}\n`;
	return output;
}

// Generate IntrinsicElements interface
function generateIntrinsicElements(interfaceNames: string[]): string {
	let output = '\t\tinterface IntrinsicElements {\n';

	for (const interfaceName of interfaceNames.toSorted()) {
		// Convert IonButton -> ion-button
		const tagName = interfaceName
			.replace(/^Ion/, 'ion-')
			.replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2')
			.toLowerCase();
		output += `\t\t\t'${tagName}': ${interfaceName} & HTMLBaseAttributes;\n`;
	}

	output += `\t\t}\n`;
	return output;
}

// Generate the complete app.d.ts content
function generateAppDTS(interfaces: Map<string, PropertyInfo[]>, types: Set<string>): string {
	const interfaceNames = [...interfaces.keys()].toSorted();

	let output = `/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type, sonarjs/use-type-alias */\n\n`;

	// Add imports - sort and format nicely
	const sortedTypes = [...types].toSorted();
	output += `import {\n`;

	// Format imports in groups of 3 per line
	for (let index = 0; index < sortedTypes.length; index++) {
		const isLast = index === sortedTypes.length - 1;
		output += `\t${sortedTypes[index]}${isLast ? '' : ','}\n`;
	}

	output += `} from '@ionic/core';\n`;
	output += `import { HTMLAttributes } from 'svelte/elements';\n\n`;

	// Add HTMLBaseAttributes
	output += `interface HTMLBaseAttributes extends HTMLAttributes<HTMLBaseElement> {}\n\n`;

	// Start declare global
	output += `declare global {\n`;
	output += `\tnamespace svelteHTML {\n`;

	// Generate all interfaces
	for (const interfaceName of interfaceNames) {
		const properties = interfaces.get(interfaceName)!;
		output += generateInterface(interfaceName, properties);
		output += '\n';
	}

	// Generate IntrinsicElements
	output += generateIntrinsicElements(interfaceNames);

	// Close namespace and declare global
	output += `\t}\n`;
	output += `}\n`;

	return output;
}

// Main function
function main(): void {
	console.info('🔄 Starting Ionic types synchronization...\n');

	// Read source file
	console.info(`📖 Reading ${IONIC_TYPES_PATH}...`);
	const ionicTypesContent = readFileSync(IONIC_TYPES_PATH, 'utf8');

	// Extract interfaces
	console.info('🔍 Extracting LocalJSX interfaces...');
	const interfaces = extractLocalJSXInterfaces(ionicTypesContent);
	console.info(`   Found ${interfaces.size} interfaces`);

	// Extract types
	console.info('🔍 Extracting required types...');
	const types = extractRequiredTypes(interfaces);
	console.info(`   Found ${types.size} type imports needed`);

	// Generate new content
	console.info('✨ Generating svelteHTML namespace...');
	const newContent = generateAppDTS(interfaces, types);

	// Write to file
	console.info(`💾 Writing to ${APP_D_TS_PATH}...`);
	writeFileSync(APP_D_TS_PATH, newContent, 'utf8');

	console.info('\n✅ Ionic types synchronized successfully!');
	console.info(`   ${interfaces.size} interfaces processed`);
	console.info(`   ${types.size} types imported`);
}

// Run the script
try {
	main();
} catch (error) {
	console.error('❌ Error:', error);
}
