const types = require("@babel/types");
const addProperty = () => ({
  visitor: {
    JSXOpeningElement(path) {
      const { name, attributes } = path.node;
      let flag = !attributes.some(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name.name === "class"
      )
      if (flag) {
        // 添加属性到元素
        path.node.attributes.push(
          types.jsxAttribute(
            types.jsxIdentifier(`data-v-${new Date().getTime()}`),
            types.stringLiteral("true")
          )
        );
      }
    },
  },
})
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
      const result = babel.transformSync(jsx, {
        plugins: [plugin, addProperty()], presets: [presetEnv, presetTypescript], filename: args.path
      });
      return { contents: result.code };
    });
  },
});

module.exports.jsxTransform = jsxTransform