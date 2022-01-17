import esbuild from 'esbuild';
import scss from 'esbuild-plugin-sass';
import svg from 'esbuild-plugin-svgr';

esbuild
    .build({
        entryPoints: [
            'sidebar/sidebar.tsx',
            'test.ts',
            'report-window/report-window.tsx',
            'background.ts',
        ],
        bundle: true,
        outdir: './lib',
        plugins: [scss(), svg()],
        watch: {
            onRebuild(error, result) {
                try {
                    console.log('watch build succeeded:', result);
                } catch (error) {
                    console.error('watch build failed:', error);
                }
            },
        },
    })
    .catch(() => process.exit(1));

//   npx esbuild sidebar/sidebar.tsx test.ts --bundle report-window/report-window.tsx --bundle background.ts --bundle --outdir=./lib