const spicedPg = require('spiced-pg');
const dbUrl = `postgres://${require('../.secret.json').dbAccess}@localhost:5432/imageboard`;
const db = spicedPg(dbUrl)


exports.getRecentImages = () => {
    let q = `SELECT url, title FROM images;`
    return db.query(q)
}


//getRecentImages().then(data => console.log(data.rows))
