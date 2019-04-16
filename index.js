const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const db = require('./utility/db')

app.use(require('body-parser').json())
app.use(express.static(__dirname + '/public/'))



app.get('/getRecent', (req, res) => {
    db.getRecentImages()
        .then(({rows}) => {
            res.json(rows)
        })
})


app.listen(8080)
