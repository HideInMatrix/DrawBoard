/*
 * @Author: David
 * @Date: 2022-05-10 11:13:14
 * @LastEditTime: 2023-11-09 15:38:22
 * @LastEditors: David
 * @Description: 打包运行的脚本
 * @FilePath: /DrawBoard/scripts/build.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
// 这里用到了之前安装的minimist以及esbuild模块
const args = require("minimist")(process.argv.slice(2)); // node scripts/dev.js reactivity -f global
const { context } = require("esbuild");
// console.log(args)
const { resolve } = require("path"); // node 内置模块

const format = args.f || "global"; // 打包的格式

// iife 立即执行函数 (function(){})();
// cjs node中的模块 module.exports
// esm 浏览器中的esModule模块 import
const outputFormat = format.startsWith("global")
  ? "iife"
  : format == "cjs"
    ? "cjs"
    : "esm";

const watchBuild = () => ({
  name: "draw-board",
  setup(build) {
    let count = 0;
    build.onEnd((result) => {
      console.log("打包完成")
      process.exit(0)
    });
  },
});
const jsxTransform = () => ({
  name: "jsx-transform",
  setup(build) {
    const fs = require("fs");
    const babel = require("@babel/core");
    const plugin = require("@babel/plugin-transform-react-jsx").default(
      {},
      { runtime: "automatic" }
    );
    const presetEnv = require('@babel/preset-env');
    const presetTypescript = require('@babel/preset-typescript');


    build.onLoad({ filter: /\.[j|t]sx$/ }, async (args) => {
      const jsx = await fs.promises.readFile(args.path, "utf8");

      const result = babel.transformSync(jsx, { plugins: [plugin], presets: [presetEnv, presetTypescript], filename: args.path });
      return { contents: result.code };
    });
  },
});

const fs = require("fs");
let idPrefix = 'icon'
const svgTitle = /<svg([^>+].*?)>/
const clearHeightWidth = /(width|height)="([^>+].*?)"/g
const hasViewBox = /(viewBox="[^>+].*?")/g
const clearReturn = /(\r)|(\n)/g
const findSvgFile = async (dir) => {
  const content = await fs.promises.readFile(dir, "utf8")
  const fileName = dir.replace(/^.*[\/]/, "").replace(/\.[^.]*$/, "")
  const svg = content.toString().replace(clearReturn, '').replace(svgTitle, ($1, $2) => {
    let width = '0'
    let height = '0'
    let content = $2.replace(
      clearHeightWidth,
      (s1, s2, s3) => {
        if (s2 === 'width') {
          width = s3
        } else if (s2 === 'height') {
          height = s3
        }
        return ''
      }
    )
    if (!hasViewBox.test($2)) {
      content += `viewBox="0 0 ${width} ${height}"`
    }
    return `<symbol id="${idPrefix}-${fileName}" ${content}>`
  }).replace('</svg>', '</symbol>')
  return { svg, fileName }
}

const svgBuilder = () => ({
  name: "svg-builder",
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async (args) => {
      const path = args.path;
      let { svg, fileName } = await findSvgFile(path)
      let content = `export default  \`${svg}\`;`;
      return { contents: content }
    });
  },
});

const cssPlugin = require("esbuild-sass-plugin");
//esbuild
//天生就支持ts
context({
  entryPoints: [resolve(__dirname, `../src/main.ts`)],
  outfile: "dist/DrawBoard.js", //输出的文件
  bundle: true, //把所有包全部打包到一起
  sourcemap: true,
  format: outputFormat, //输出格式
  globalName: "DrawBoard", //打包全局名，上次在package.json中自定义的名字
  platform: format === "cjs" ? "node" : "browser", //项目运行的平台
  plugins: [watchBuild(), jsxTransform(), cssPlugin.sassPlugin(), svgBuilder()],
  jsxFactory: "h",
  jsxFragment: "Fragment",
  loader: {
    ".tsx": "tsx",
    ".jsx": "jsx",
    ".js": "js",
    ".ts": "ts",
    ".scss": "css",
    ".svg": "js"
  },
  treeShaking: true,
})
  .then((ctx) => {
    ctx.serve({
      servedir: ".",
      port: 8002,
    });
    return ctx;
  })
  .then((ctx) => ctx.watch())
