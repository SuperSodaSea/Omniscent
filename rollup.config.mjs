import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import rollupPluginBabel from '@rollup/plugin-babel';
import rollupPluginCommonJS from '@rollup/plugin-commonjs';
import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginCopy from 'rollup-plugin-copy';
import rollupPluginDelete from 'rollup-plugin-delete';
import { minify as rollupPluginEsbuildMinify } from 'rollup-plugin-esbuild';


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));


const extensions = ['.js', '.ts'];

const plugins = [
    rollupPluginNodeResolve({ extensions }),
    rollupPluginCommonJS(),
    rollupPluginBabel({
        babelHelpers: 'runtime',
        compact: false,
        extensions,
        sourceMaps: true,
    }),
];

export default (async () => {
    const pkg = JSON.parse(await fs.readFile(path.join(__dirname, 'package.json')));
    const { dependencies } = pkg;
    const external = [
        ...Object.keys(dependencies || [])
            .flatMap(name => [name, new RegExp(`^${name}/`)]),
    ];
    
    return [
        {
            plugins: [
                ...plugins,
                rollupPluginDelete({
                    targets: ['lib/*'],
                }),
            ],
            input: 'src/index.ts',
            output: [
                {
                    dir: path.join(__dirname, 'lib', 'cjs'),
                    entryFileNames: '[name].js',
                    format: 'cjs',
                    preserveModules: true,
                    preserveModulesRoot: path.join(__dirname, 'src'),
                    sourcemap: true,
                },
                {
                    dir: path.join(__dirname, 'lib', 'esm'),
                    entryFileNames: '[name].mjs',
                    format: 'esm',
                    preserveModules: true,
                    preserveModulesRoot: path.join(__dirname, 'src'),
                    sourcemap: true,
                },
            ],
            external,
        },
        {
            plugins: [
                ...plugins,
                rollupPluginEsbuildMinify(),
                rollupPluginDelete({
                    targets: ['dist/*'],
                }),
                rollupPluginCopy({
                    targets: [{ src: 'demo/public/*', dest: 'dist' }],
                }),
            ],
            input: 'demo/src/index.ts',
            output: {
                dir: path.join(__dirname, 'dist'),
                entryFileNames: '[name].js',
                format: 'iife',
                sourcemap: true,
            },
        }
    ];
})();
