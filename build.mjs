import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

// Classic JSX transform so the prototype's global-`React` + window.* pattern
// works unchanged. React is bundled and exposed as a global by globals.js.
const options = {
  entryPoints: ['src/index.jsx'],
  bundle: true,
  format: 'iife',
  outfile: 'dist/growcontrol-card.js',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: { '.jsx': 'jsx', '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  legalComments: 'none',
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('watching...');
} else {
  await esbuild.build(options);
  console.log('built dist/growcontrol-card.js');
}
