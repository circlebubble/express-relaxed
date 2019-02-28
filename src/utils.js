const Fs = require('fs')
const Path = require('path')
const Unique = require('uniqid')
const Charts = require('chartjs-node')

const createFile = (name, content, format) => {
  if (!Fs.existsSync(Path.join(process.cwd(), 'build'))) {
    Fs.mkdirSync(Path.join(process.cwd(), 'build'))
  }

  const fileName = Unique(`${name}-`)
  const file = Path.join(process.cwd(), 'build', fileName)

  return new Promise((resolve, reject) => {
    Fs.writeFile(`${file}.${format}`, content, (err, done) => {
      if (err) {
        return reject(err)
      }

      return resolve({
        file: `${file}.${format}`,
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
      .then(() => chartNode.getImageStream('image/png'))
      .then(() => {
        const chartName = Unique('chart-')

        chartNode.writeImageToFile('image/png', `${Path.join(process.cwd(), 'build', chartName)}.png`)

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

module.exports = {
  createFile,
  createGraph
}
