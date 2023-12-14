/*
 * @Author: David
 * @Date: 2022-05-10 11:13:14
 * @LastEditTime: 2023-12-14 15:21:37
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

const cssPlugin = require("esbuild-sass-plugin");
const { svgBuilder } = require("../plugins/svgBuild");
const { jsxTransform } = require("../plugins/jsxTransform");
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
