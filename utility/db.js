const spicedPg = require('spiced-pg');
const dbUrl = `postgres://${require('../.secret.json').DB_ACCESS}@localhost:5432/imageboard`;
const db = spicedPg(dbUrl)


exports.getRecent = () => {
    let q = `
        SELECT *, (
            SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1
        ) AS lowest_id FROM images
        ORDER BY id DESc
        LIMIT 2;`

    return db.query(q)
}

exports.getNext = (id) => {
    let q = `
        SELECT *, (
            SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1
        ) AS lowest_id, (
            SELECT id FROM images
            ORDER BY id DESC
            LIMIT 1
        ) AS highest_id FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 2;`;
    let params = [id];
    return db.query(q, params)
}

exports.getPrev = (id) => {
    let q = `
        SELECT *, (
            SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1
        ) AS lowest_id, (
            SELECT id FROM images
            ORDER BY id DESC
            LIMIT 1
        ) AS highest_id FROM images
        WHERE id > $1
        ORDER BY id DESC
        LIMIT 2;`;
    let params = [id];
    return db.query(q, params)
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

exports.getCommentsById = (id) => {
    let q = `SELECT * FROM comments WHERE id_img_fk = $1`;
    let params = [id];
    return db.query(q, params)
}

exports.postComment = (id, user, comment) => {
    let q = `
            INSERT INTO comments (id_img_fk, username, comment)
            VALUES ($1, $2, $3) RETURNING id;`;
    let params = [id, user, comment]
    return db.query(q, params)
}
