const express = require("express");
const app = express();
const ca = require("chalk-animation");
const db = require("./db");
const s3 = require("./s3");
const config = require("./config");

/// FILE UPLOAD BOILERPLATE ///
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
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

/// FILE UPLOAD BOILERPLATE END ///

app.use(express.static("./public"));
app.use(express.json());

app.get("/images", (req, res) => {
    db.getImagesTable()
        .then(response => {
            res.json(response);
        })
        .catch(error => {
            console.log("error from app.get /images: ", error);
        });
    // console.log("This is the images route");
});

app.get("/image-overlay/:id", (req, res) => {
    db.getImages(req.params.id)
        .then(response => {
            res.json(response);
        })
        .catch(error => {
            console.log("error from app.get /image-overlay: ", error);
        });
    // console.log("This is the overlay route");
});

app.get("/more-images/:id", (req, res) => {
    db.getMoreImages(req.params.id)
        .then(response => {
            res.json(response);
        })
        .catch(error => {
            console.log("error from app.get /more-images: ", error);
        });
    // console.log("This is the more-images route");
});

app.get("/comments/:id", (req, res) => {
    db.getComments(req.params.id)
        .then(response => {
            // console.log("response from /comments/:id", response);
            res.json(response.rows);
        })
        .catch(error => {
            console.log("error from app.get /comments: ", error);
        });
    // console.log("This is the get comments route");
});

app.post("/comments/:id", (req, res) => {
    const { username, comment } = req.body;
    db.addComments(username, comment, req.params.id)
        .then(response => {
            console.log("response from app.post /comments", response);
            res.json(response);
        })
        .catch(error => {
            console.log("error from app.post /comments: ", error);
        });
    // console.log("This is the post comments  route");
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // req.file -> the file that was just uploaded
    // req.body -> refers to the values we type in the input field
    const { filename } = req.file;
    const url = config.s3Url + filename;
    // console.log("url", url);
    const { title, username, description } = req.body;
    if (req.file) {
        db.addImages(url, username, title, description)
            .then(function(data) {
                res.json(data);
            })
            .catch(function(error) {
                console.log("error in app.post /upload: ", error);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.listen(8080, () => {
    ca.rainbow("ʕ•ᴥ•ʔ Imageboard Express is running...");
});
