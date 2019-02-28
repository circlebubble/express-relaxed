const Fs       = require('fs')
const Path     = require('path')
const Outdent  = require('outdent')
const Render   = require('handlebars')
const MarkPug  = require('markdown-to-pug')
const Markdown = require('markdown-to-json')

const Pug = new MarkPug()

const Replace  = (string, chart) => {
  const REG_DETAIL = /^---((.|[\r\n])*?)---\n/gm
  const REG_CHART  = /\[charts\]\((.*)\)/gm
  const REG_BREAK  = /<!--.?break.?-->/gm

  return string
    .replace(REG_DETAIL, '')
    .replace(REG_CHART, (tag, index) => {
      if (index) {
        return `img(src="./${chart[parseInt(index) - 1]}.png")`
      }
    })
    .replace(REG_BREAK, (tag, index) => {
      return `<div class="page-break"></div>`
    })
}

module.exports = (theme, string, { file, fileName }, diagram) => {
  const source = Fs.readFileSync(`${Path.join(process.cwd(), 'src/themes/template', theme)}.pug`, 'utf-8')
  const data = Markdown.parse([file], {
    minify: false,
    width: 70,
    outfile: null
  })
  const render = Render.compile(source)
  const content = Replace(string, diagram)

  return Outdent`
    style
      ${ theme ? `include:scss ../src/themes/styles/${theme}.scss` : '' }

    ${
      render(JSON.parse(data)[fileName])
        .replace('<!--CONTENT-->', Pug.render(content))
        .replace(/p.(\$.+)|p.(img.+)/gm, (_, equation, tag) => {
          if (equation && equation.includes('$')) {
            return `p $${equation}$`
          }

          if (tag) {
            return tag
          }
        })
    }
  `
}