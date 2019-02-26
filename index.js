const fs = require('fs')
const path = require('path')
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const execute = require('promise-exec')
const Charts = require('chartjs-node')
const template = require('./template')
const uniqid = require('uniqid')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(process.cwd(), 'example')))

const createFile = (name, content) => {
  if (!fs.existsSync(path.join(process.cwd(), 'render'))) {
    fs.mkdirSync(path.join(process.cwd(), 'render'))
  }

  const fileName = uniqid(`${name}-`)
  const file = path.join(process.cwd(), 'render', fileName)

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

const renderGraph = (options) => {
  return new Promise(resolve => {
    const chartNode = new Charts(options.width, options.height)
    return chartNode.drawChart(options)
      .then(() => chartNode.getImageBuffer('image/png'))
      .then(buffer => chartNode.getImageStream('image/png'))
      .then(() => {
        const chartName = uniqid('chart-')

        chartNode.writeImageToFile('image/png', `${path.join(process.cwd(), 'render', chartName)}.png`)

        resolve(chartName)
      })
  })
}

const createGraph = (charts) => {
  return new Promise(resolve => {
    if (!charts) resolve('')

    Promise.all(JSON.parse(charts).map(item => {
      return renderGraph(item)
    }))
    .then(res => {
      resolve(res)
    })
  })
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/example/browser.html')
})

app.post('/', async (req, res) => {
  const { name, theme, content, charts } = req.body

  const generatedChart = await createGraph(charts)
  const { file, fileName } = await createFile(name, template(theme, content, generatedChart))

  await execute(`relaxed ${file} --build-once`)
  await execute('cd ./render && ls | grep ".htm" | xargs rm && ls | grep ".pug" | xargs rm && ls | grep ".png" | xargs rm')

  res.json({
    name: fileName
  })
})

app.get('/preview/:name', (req, res) => {
  const data = fs.readFileSync(path.resolve(__dirname, 'render', req.params.name + '.pdf'))

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-disposition': 'inline;filename=' + req.params.name + '.pdf',
    'Content-Length': data.length
  })

  res.end(new Buffer(data, 'binary'))
})

app.listen(3100)

console.log('Server listen at http://localhost:3100')