import esbuild from 'esbuild';
import scss from 'esbuild-plugin-sass';

const watch = process.argv.includes('--watch') && {
    onRebuild(error) {
        if (error) console.error('[watch] build failed', error);
        else console.log('[watch] build finished');
    },
};

// see https://github.com/evanw/esbuild/issues/806#issuecomment-779138268
let skipReactImports = {
    name: 'skipReactImports',
    setup(build) {
        build.onResolve({ filter: /^react(-dom)?$/ }, (args) => {
            return {
                path: args.path,
                namespace: `globalExternal_${args.path}`,
            };
        });

        build.onLoad(
            { filter: /.*/, namespace: 'globalExternal_react' },
            () => {
                return {
                    contents: `module.exports = globalThis.React`,
                    loader: 'js',
                };
            }
        );

        build.onLoad(
            { filter: /.*/, namespace: 'globalExternal_react-dom' },
            () => {
                return {
                    contents: `module.exports = globalThis.ReactDOM`,
                    loader: 'js',
                };
            }
        );
    },
};

esbuild
    .build({
        entryPoints: [
            'components/toolbar/toolbar.tsx',
            'components/sidebar/sidebar.tsx',
            'test.ts',
            'components/report-window/report-window.tsx',
            'background.ts',
        ],
        bundle: true,
        // minify: true,
        outdir: './lib',
        loader: { '.woff': 'file', '.woff2': 'file' },
        plugins: [scss(), skipReactImports],
        define: {
            PLUGIN_NAME: '"Rentgen"',
            PLUGIN_URL: '"https://git.internet-czas-dzialac.pl/icd/rentgen"',
        },
        external: ['react', 'react-dom'],
        watch,
    })
    .then(() => console.log('Add-on was built'))
    .catch(() => process.exit(1));
