

/**
 * @description: 生成一个指定长度到随机字符
 * @param {*} len
 * @return {*}
 * @Date: 2023-12-26 09:42:08
 * @Author: David
 */
const generateString = (len = 6) => {
  const characters = `abcdefghijklmnopqrstuvwxyz0123456789`;
  let result = '';
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;

}
const generateStr = generateString()

const postcss = require('postcss');

const cssScopedPlugin = () => ({
  name: "css-scoped-plugin",
  setup(build) {
    const fs = require("fs");
    const plugin = {
      postcssPlugin: 'css-parser',
      Rule(node) {
        node.selectors = node.selectors.map((selector) => `${selector}[data-v-${generateStr}]`)
      }
    }

    build.onLoad({ filter: /(?:\.css|\.scss)$/ }, async (args) => {
      const cssFile = await fs.promises.readFile(args.path, "utf8");
      let result = await postcss([plugin]).process(cssFile, { from: undefined })

      return {
        contents: result.css,
        loader: 'css'
      };
    });
  },
});

/**
 * @description: 增加属性到dom元素上
 * @return {*}
 * @Date: 2023-12-26 09:40:39
 * @Author: David
 */
const types = require("@babel/types");
const addProperty = () => ({
  visitor: {
    JSXOpeningElement(path) {
      const { name, attributes } = path.node;
      let flag = attributes.some(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name.name === "className"
      )

      if (flag) {
        // 添加属性到元素
        console.log(path.node, '1234\n');
        path.node.attributes.push(
          types.jsxAttribute(
            types.jsxIdentifier(`data-v-${generateStr}`),
            types.stringLiteral("")
          )
        );
      }
    },
  },
})

module.exports.addProperty = addProperty
module.exports.cssScopedPlugin = cssScopedPlugin