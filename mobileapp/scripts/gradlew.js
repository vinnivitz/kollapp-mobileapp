import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const androidDirectory = path.resolve(projectDirectory, 'android');

const gradlew =
	process.platform === 'win32'
		? path.resolve(androidDirectory, 'gradlew.bat')
		: path.resolve(androidDirectory, 'gradlew');

const arguments_ = process.argv.slice(2);

console.log(`Running: ${gradlew} -p ${androidDirectory} ${arguments_.join(' ')}`);
execFileSync(gradlew, ['-p', androidDirectory, ...arguments_], {
	cwd: projectDirectory,
	shell: process.platform === 'win32',
	stdio: 'inherit'
});
