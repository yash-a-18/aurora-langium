//@ts-check
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

const success = watch ? 'Watch build succeeded' : 'Build succeeded';

function getTime() {
    const date = new Date();
    return `[${`${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}`}] `;
}

function padZeroes(i) {
    return i.toString().padStart(2, '0');
}

const plugins = [{
    name: 'watch-plugin',
    setup(build) {
        build.onEnd(result => {
            if (result.errors.length === 0) {
                console.log(getTime() + success);
            }
        });
    },
}];

// Build for CommonJS
const cjsContext = await esbuild.context({
    entryPoints: ['src/extension/main.ts', 'src/language/main.ts','src/extension/langclientconfig.ts'],
    outdir: 'dist/cjs', // Output directory for CommonJS
    bundle: true,
    target: "ES2017",
    format: 'cjs', // Ensure output is CommonJS
    outExtension: {
        '.js': '.cjs' // Change .js to .cjs for CommonJS output
    },
    loader: { '.ts': 'ts' },
    external: ['vscode'],
    platform: 'node',
    sourcemap: !minify,
    minify,
    plugins
});

// Build for ES Module
const esmContext = await esbuild.context({
    entryPoints: ['src/extension/main.ts', 'src/language/main.ts'],
    outdir: 'dist/esm', // Output directory for ES Module
    bundle: true,
    target: "ES2017",
    format: 'esm', // Ensure output is ES Module
    loader: { '.ts': 'ts' },
    external: ['vscode'],
    platform: 'node',
    sourcemap: !minify,
    minify,
    plugins
});

// Watch or rebuild based on the command line argument
if (watch) {
    await Promise.all([
        cjsContext.watch(),
        esmContext.watch()
    ]);
} else {
    await Promise.all([
        cjsContext.rebuild(),
        esmContext.rebuild()
    ]);
    cjsContext.dispose();
    esmContext.dispose();
}
