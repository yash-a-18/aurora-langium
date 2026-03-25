import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const langiumConfigPath = path.join(repoRoot, 'langium-config.json');

function getGeneratedAstPath() {
    const langiumConfig = JSON.parse(fs.readFileSync(langiumConfigPath, 'utf8'));
    if (typeof langiumConfig.out !== 'string' || langiumConfig.out.length === 0) {
        throw new Error(`Missing or invalid "out" field in ${langiumConfigPath}`);
    }
    return path.resolve(repoRoot, langiumConfig.out, 'ast.ts');
}

function patchGeneratedAst(astPath) {
    const source = fs.readFileSync(astPath, 'utf8');
    const target = ' as const satisfies langium.AstMetaData';

    if (!source.includes(target)) {
        return false;
    }

    const patched = source.replace(target, ' satisfies langium.AstMetaData');
    fs.writeFileSync(astPath, patched);
    return true;
}

const astPath = getGeneratedAstPath();
if (!fs.existsSync(astPath)) {
    throw new Error(`Generated AST file not found: ${astPath}`);
}

const patched = patchGeneratedAst(astPath);
console.log(
    patched
        ? `Patched Langium AST metadata in ${path.relative(repoRoot, astPath)}`
        : `No Langium AST metadata patch needed for ${path.relative(repoRoot, astPath)}`
);
