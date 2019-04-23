const knox = require('knox-s3')
const fs = require('fs')
const path = require('path')
const url = require('url')

///////////
// WARNING: maybe turn conditions back on..
///////////

let sec;
// if (process.env.NODE_ENV == 'production') {
//     sec = process.env; // in prod the secrets are environment variables
// } else {
    sec = require('../.secret');
// }

const client = knox.createClient({
    key: sec.AWS.AWS_KEY,
    secret: sec.AWS.AWS_SECRET,
    bucket: 'jaypexterimg'
});

exports.upload = function(req, res, next) {
    if (!req.file) {
        return res.sendStatus(500);
    }
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    const stream = fs.createReadStream(req.file.path);
    stream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        //console.log('s3', req.body);
        if (s3Response.statusCode == 200) {
            res.locals.newImg = {
                url: s3Response.req.url,
                title: req.body.iTitle,
                description: req.body.iDescr,
                username: req.body.iUser
            }
            next();
            fs.unlink(req.file.path, () => {});
        } else {
            res.sendStatus(500);
        }
    })
}

exports.deleteImg = (req, res, next) => {
    try {
        let delBase = path.parse(req.body.delUrl).base;
        console.log('deleting from bucket..', delBase);
        client.deleteFile(`/${delBase}`, (err, res) => {
            if (err) {
                console.log('err del s3..', err);
                res.sendStatus(500);
            } else {
                console.log('deleted', res.statusCode);
            }
        })
    } catch (err) {
        console.log('err del s3..', err);
        res.sendStatus(500);
    }
    next()

}
