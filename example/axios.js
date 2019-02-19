const axios = require('axios')
const server = 'http://localhost:3100/'

axios({
  method: 'post',
  url: server,
  data: {
    name: 'client',
    content: ''+
      '\n# Hi There\n'+
      '\nWelcome to the jungle\n'+
      '| Hello | there | this | is | Table |\n'+
      '|:---:|:---:|:---:|:---:|:---:|\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '| And | this | is | a | content |\n'+
      '\n## Some text here\n'+
      '\nAnd another here\n'+
      '\n![](http://placehold.it/300x300?text=JOIN+OUR+TEAM)\n'+
      '\nFoot note\n'
  }
})
.then(({ data }) => {
  // PDF Buffer
  // console.log(data)
})