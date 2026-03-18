import { execSync } from 'node:child_process';

let output;
try {
	const unused = execSync('i18n-unused display-unused', { encoding: 'utf8' });
	const missed = execSync('i18n-unused display-missed', { encoding: 'utf8' });
	output = unused + missed;
} catch (error) {
	throw new Error(`i18n check error: ${error.message}`, { cause: error });
}

const hasNoUnused = /Total unused translations count: 0/.test(output);
const hasNoMissed = /Total missed.*count: 0/.test(output);

if (hasNoUnused && hasNoMissed) {
	console.log('i18n check passed: no unused or missed translations.');
} else {
	console.log(output);
	throw new Error('i18n check failed: there are unused or missed translations.');
}
