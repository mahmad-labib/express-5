var fs = require('fs');
function DeleteImages(files) {
    console.log(files);
    if (Array.isArray(files)) {
        files.forEach(async element => {
            await fs.unlinkSync(element.path || element)
        });
        return true
    } else {
        fs.unlinkSync(files.path || files)
        return true;
    }
}
module.exports = DeleteImages