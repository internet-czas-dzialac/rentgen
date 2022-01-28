import esbuild from 'esbuild';
import scss from 'esbuild-plugin-sass';
import svg from 'esbuild-plugin-svgr';

const watch = process.argv.includes('--watch') && {
    onRebuild(error) {
        if (error) console.error('[watch] build failed', error);
        else console.log('[watch] build finished');
    },
};

esbuild
    .build({
        entryPoints: [
            'sidebar/sidebar.tsx',
            'test.ts',
            'report-window/report-window.tsx',
            'background.ts',
        ],
        bundle: true,
        minify: true,
        outdir: './lib',
        loader: { '.woff': 'file', '.woff2': 'file' },
        plugins: [scss(), svg()],
        watch,
    })
    .then(() => console.log('Add-on was built'))
    .catch(() => process.exit(1));
