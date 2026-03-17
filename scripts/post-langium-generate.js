import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const astPath = resolve('src/language/generated/ast.ts');
const token = '} as const satisfies langium.AstMetaData';

try {
    const contents = readFileSync(astPath, 'utf8');

    if (!contents.includes(token)) {
        console.warn('[post-langium-generate] Expected snippet not found in ast.ts; no changes made.');
        process.exit(0);
    }

    const updated = contents.replace(token, '} satisfies langium.AstMetaData');

    if (updated === contents) {
        console.warn('[post-langium-generate] Replacement produced no changes.');
        process.exit(0);
    }

    writeFileSync(astPath, updated, 'utf8');
    console.log('[post-langium-generate] Normalized langium AstMetaData satisfies clause.');
} catch (error) {
    console.error('[post-langium-generate] Failed to update generated ast.ts:', error);
    process.exitCode = 1;
}
