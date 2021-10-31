const conf = {
    // Start port
    port: 3030,

    // Database configuration
    database: {
        DATABASE: 'test',
        USERNAME: 'adam',
        PASSWORD: '01030',
        HOST: 'localhost'
    }
}

const roles = {
    admin: 'admin',
    moderator: 'moderator',
    author: 'author',
    junior: 'junior'
}

//Multer Settings For Images
var multer = require('multer');
var fs = require('fs');
const dest = `./public/images/`;
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.access(dest, function (error) {
            if (error) {
                console.log("Directory does not exist.");
                return fs.mkdir(dest, (error) => cb(error, dest));
            } else {
                console.log("Directory exists.");
                return cb(null, dest);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage })

module.exports = { conf, roles, upload, dest}