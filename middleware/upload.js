const path = require('path');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,'uploads/');
    },
    filename: function(req, file, cb) {
        console.log('from middleware: '+  file);
        let ext = path.extname(file.originalName);
        cb(null, Date.now()+ext);
    }
 
})
var upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if( file.mimetype == 'image/jpg' || 
            file.mimetype == 'image/jpeg' || 
            file.mimetype == 'image/png'){
        cb(null,true);
        }
        else{
            console.log('only jpg and png is supported');
            cb(null,false);
        }  
        limits:{
            filesize: 1024 *1024 * 2
        }
    }

})

module.exports = upload;
