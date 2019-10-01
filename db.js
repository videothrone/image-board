const spicedPg = require("spiced-pg");
const { dbuser, dbpass } = require("./secrets");
let db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/imageboard`);

exports.getImagesTable = () => {
    return db.query(`SELECT url, title, id FROM images
        ORDER BY created_at DESC
        LIMIT 10`);
};

exports.addImages = function(url, username, title, description) {
    return db.query(
        `INSERT INTO images (url, username, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
        [url, username, title, description]
    );
};

exports.getImages = function(id) {
    return db.query(
        `SELECT url, username, title, description
        FROM images
        WHERE id = $1`,
        [id]
    );
};

exports.getComments = function(id) {
    return db.query(
        `SELECT username, comment, created_at
        FROM comments
        WHERE images_id = $1
        ORDER BY created_at DESC`,
        [id]
    );
};

exports.addComments = function(username, comment, images_id) {
    return db.query(
        `INSERT INTO comments (username, comment, images_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
        [username, comment, images_id]
    );
};

exports.getMoreImages = lastId => {
    return db
        .query(
            `SELECT *, (
                SELECT id
                FROM images
                ORDER BY id ASC
                LIMIT 1
            )AS "lowestId" FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 10`,
            [lastId]
        )
        .then(({ rows }) => rows);
};
