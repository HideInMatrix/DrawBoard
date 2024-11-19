const fs = require("fs");
let idPrefix = 'icon'
const svgTitle = /<svg([^>+].*?)>/
const clearHeightWidth = /(width|height)="([^>+].*?)"/g
const hasViewBox = /(viewBox="[^>+].*?")/g
const clearReturn = /(\r)|(\n)/g
const findSvgFile = async (dir) => {
  const content = await fs.promises.readFile(dir, "utf8")
  const fileName = dir.replace(/^.*[\\\/]/, "").replace(/\.[^.]*$/, "")
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

module.exports.svgBuilder = svgBuilder
