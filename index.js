const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const markdown = require('markdown-to-pug')
const execute = require('promise-exec')
const uniqid = require('uniqid')
const outdent = require('outdent')
const app = express()
const pug = new markdown()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

const createFile = (name, content) => {
  if (!fs.existsSync(path.join(process.cwd(), 'build'))) {
    fs.mkdirSync(path.join(process.cwd(), 'build'))
  }

  const fileName = uniqid(`${name}-`)
  const file = path.join(process.cwd(), 'build', fileName)

  return new Promise((resolve, reject) => {
    fs.writeFile(`${file}.pug`, content, (err, done) => {
      if (err) {
        return reject(err)
      }

      return resolve({
        file: `${file}.pug`,
        fileName: fileName
      })
    })
  })
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/example/browser.html')
})

app.post('/', async (req, res) => {
  const { name, theme, content } = req.body
  const template = outdent`
    ${pug.render(content)}
    style
      include:scss ../styles/main.scss
      ${ theme ? `include:scss ../styles/theme/${theme}.scss` : ''}
  `
  const { file, fileName } = await createFile(name, template)

  await execute(`relaxed ${file} --build-once`)
  await execute('cd ./build && ls | grep ".htm" | xargs rm && ls | grep ".pug" | xargs rm')

  res.json({
    name: fileName
  })
})

app.get('/preview/:name', (req, res) => {
  const data = fs.readFileSync(path.resolve(__dirname, 'build', req.params.name + '.pdf'))

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-disposition': 'inline;filename=' + req.params.name,
    'Content-Length': data.length
  })

  res.end(new Buffer(data, 'binary'))
})

app.listen(3100)

console.log('Server listen at http://localhost:3100')