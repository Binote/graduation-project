var express = require('express');
var app = express();
const fs = require('fs');
var multer  = require('multer');

//只能以Form形式上传name为mFile的文件
//var upload = multer({ dest: 'upload/'}).single('mFile');
var upload = multer({dest:'upload/'}).any();


app.post('/upload',function(req,res){
    console.log("---------访问上传路径-------------");

    /** When using the "single"
     data come in "req.file" regardless of the attribute "name". **/
    upload(req, res, function (err) {
        //添加错误处理
        if (err) {
            console.log(err);
            return;
        }
        req.file = req.files[0];
        var tmp_path = req.file.path;
        console.log(tmp_path);

        /** The original name of the uploaded file
         stored in the variable "originalname". **/
        var target_path = '../binote-bim-work/uploads/' + req.file.originalname;

        /** A better way to copy the uploaded file. **/
        console.log(target_path);


        if (!fs.existsSync('../binote-bim-work/uploads/')) {
            fs.mkdirSync('../binote-bim-work/uploads/');
        }

        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        src.on('end', function() {
            res.end();
        });
        src.on('error', function(err) {

            res.end();
            console.log(err);
        });

    });



});

var port = 20001;
var hostname = '127.0.0.1';
app.listen(port,hostname,() => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
