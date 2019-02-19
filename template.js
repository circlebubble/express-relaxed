const markdown = require('markdown-to-pug')
const pug = new markdown()
const outdent = require('outdent')

module.exports = (theme, content) => {
  return outdent`
    style
      ${ theme ? `include:scss ../styles/theme/${theme}.scss` : ''}

    ${pug.render(content)}

    template#page-footer
      style(type='text/css').
        .page-footer {
          width: 100%;
          font-size: 14px;
          text-align: right;
          margin-bottom: 0.5cm;
          margin-right: 1cm;
        }
      .page-footer #[span.pageNumber] / #[span.totalPages]
  `
}