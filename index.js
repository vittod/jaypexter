const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const uidSafe = require('uid-safe')
const path = require('path')
const db = require('./utility/db')
const s3 = require('./utility/s3')

app.use(require('body-parser').json())
app.use(express.static(__dirname + '/public/'))


const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});


app.get('/getRecent', (req, res) => {
    db.getRecent()
        .then(({rows}) => {
            res.json(rows)
        })
})

app.get('/getNext/:id', (req, res) => {
    db.getNext(req.params.id)
        .then(({rows}) => {
            console.log(rows);
            res.json(rows)
        })
})

app.get('/getPrev/:id', (req, res) => {
    db.getPrev(req.params.id)
        .then(({rows}) => {
            console.log(rows);
            res.json(rows)
        })
})

app.get('/getById/:id', (req, res) => {
    console.log('para', req.params.id);
    db.getById(req.params.id)
        .then(({rows}) => {
            console.log('index', rows);
            res.json(rows)
        })
        .catch(err => {
            res.status(404).json([])
            console.log('no img..', err);
        })
})

app.post('/postImg', uploader.single('iFile'), s3.upload, (req, res) => {
    console.log('index', res.locals.newImg)
    if (req.file) {
        db.postNewImg(res.locals.newImg.url, res.locals.newImg.username, res.locals.newImg.title, res.locals.newImg.description)
            .then(dbEntry => {
                console.log(dbEntry);
                res.json({
                    success: true,
                    url: res.locals.newImg.url
                });
            })
    } else {
        res.json({
            success: false
        });
    }
})

app.post('/deleteImg', s3.deleteImg, (req, res) => {
    if (req.body.delId) {
        console.log('deleting..', req.body.delId);
        db.deleteImg(req.body.delId)
            .then(({data}) => {
                console.log(data);
                res.json(data)
            })
            .catch(err => console.log('del err..', err))
    }
})

app.get('/getCommentsById/:id', (req, res) => {
    console.log('index req', req.params.id);
    db.getCommentsById(req.params.id)
        .then(({rows}) => {
            console.log('index rows', rows);
            res.json(rows)
        })
})

app.post('/postComment', (req, res) => {
    console.log('index post', req.body);
    db.postComment(req.body.id, req.body.username, req.body.comment)
        .then(data => {
            res.json(data)
        })
})


app.listen(8080)
