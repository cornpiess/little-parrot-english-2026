import autoprefixer from 'autoprefixer';
import { build, transform } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

const projectRoot = process.cwd();
const result = await build({
  entryPoints: [path.join(projectRoot, 'src/character-gallery.tsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  target: ['es2020'],
  minify: true,
  legalComments: 'none',
  write: false,
  outdir: path.join(projectRoot, '.character-gallery-build'),
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

const javascript = result.outputFiles.find((file) => file.path.endsWith('.js'));
const bundledCss = result.outputFiles.find((file) => file.path.endsWith('.css'));

if (!javascript) throw new Error('角色库 JavaScript 打包失败');

const galleryCss = bundledCss?.text ?? await readFile(path.join(projectRoot, 'src/character-gallery.css'), 'utf8');
const processedCss = await postcss([tailwindcss(), autoprefixer()]).process(galleryCss, {
  from: path.join(projectRoot, 'src/index.css'),
});
const minifiedCss = await transform(processedCss.css, { loader: 'css', minify: true });
const safeCss = minifiedCss.code.replace(/<\/style/gi, '<\\/style');
const safeJavascript = javascript.text.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f6f8ff" />
    <meta name="description" content="小鹦鹉、小狐狸、雪宝、Iron Man 与巴斯光年动作库" />
    <title>角色 SVG、Iron Man 与巴斯光年动作库</title>
    <style>${safeCss}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${safeJavascript}</script>
  </body>
</html>
`;

await writeFile(path.join(projectRoot, 'characters.html'), html, 'utf8');
console.log(`已生成 characters.html（${Math.ceil(Buffer.byteLength(html) / 1024)} KB，可直接双击打开）`);
