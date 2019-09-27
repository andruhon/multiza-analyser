import resolve from 'rollup-plugin-node-resolve';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/js/bundle.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve()
    ]
};