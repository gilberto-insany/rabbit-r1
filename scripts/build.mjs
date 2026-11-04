import { build } from 'esbuild';
import fs from 'node:fs/promises';
await fs.mkdir('dist/js',{recursive:true});
await build({entryPoints:['src/main.js'],bundle:true,format:'esm',outfile:'dist/js/main.js',minify:true,sourcemap:false,target:'es2022'});
console.log('Built rabbit r1 product page');
