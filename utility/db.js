const spicedPg = require('spiced-pg');
const dbUrl = `postgres://${require('../.secret.json').DB_ACCESS}@localhost:5432/imageboard`;
const db = spicedPg(dbUrl)


exports.getRecent = () => {
    let q = `SELECT * FROM images;`
    return db.query(q)
}


exports.getById = (id) => {
    q = `SELECT * FROM images WHERE id = $1`;
    params = [id];
    return db.query(q, params)
}


exports.postNewImg = (url, username, title, description) => {
    let params = [url, username, title, description];
    let q = `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING id;`;
    return db.query(q, params)
}

exports.postComment(id, user, comment) {
    let q = `
            INSERT INTO comments (id_img_fk, username, comment)
            VALUES ($1, $2, $3) RETURNING id;`;
    let params = [id, user, comment]
    return db.query(q, params)
}
