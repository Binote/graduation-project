const express=require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql=require('mysql');
const uuidv1 = require('uuid/v1');
const multer = require('multer');
const fs = require('fs');
const moment = require('moment');
var upload = multer({ dest: 'upload/' }).any();

var app=express();
var server=require("http").createServer(app);
server.listen(8080);

var pool=mysql.createPool({
    host:"*.*.*.*",
    user:'*',
    password:"*",
    database:'bimjx',
    port:3306,
    connectionLimit:5,
});
var projectName='/bimjx';
app.use(cookieParser('sessiontest'));
app.use(session({
    secret: 'sessiontest',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true
}));
app.use(express.static("../binote-bim-work"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/**
 * 注册接口
 * 必填参数：
 * uname
 * upwd
 * umail
 */
app.post(projectName+"/register"+"/register",(req,res)=>{
    console.log(req.body);
    var data=req.body;
    if(data.uname && data.upwd && data.umail){
        pool.getConnection((err,conn)=>{
            if(err){
                res.json({
                    error:1,
                    msg:"从连接池获取连接失败！",
                    obj:{},
                    status:false,
                    timestamp:Date.now(),
                })
            }else{
                conn.query("SELECT * FROM jx_user WHERE userEmail = ?",[data.umail],(err,result)=>{
                    if(err){
                        console.log("sql语句执行失败！");
                        res.json({
                            error:2,
                            msg:"sql语句执行失败！",
                            obj:{},
                            status:false,
                            timestamp:Date.now(),
                        })
                    }else{
                        if(result.length>0){
                            res.json({
                                error:3,
                                msg:"该邮箱已注册，请登录或联系管理员修改密码！",
                                obj:{},
                                status:false,
                                timestamp:Date.now(),
                            })
                        }else{
                            pool.getConnection((err,conn)=>{
                                if(err){
                                    console.log("从连接池获取连接失败！");
                                    res.json({
                                        error:1,
                                        msg:"从连接池获取连接失败！",
                                        obj:{},
                                        status:false,
                                        timestamp:Date.now(),
                                    })
                                }else{
                                    console.log("从连接池获取连接成功！");
                                    conn.query("INSERT INTO jx_user VALUES (?,?,?,?,?,NULL)",[uuidv1(),data.uname,data.upwd,data.umail,data.phone],(err,result)=>{
                                        if(err){
                                            console.log("sql语句执行失败！");
                                            res.json({
                                                error:2,
                                                msg:"sql语句执行失败！",
                                                obj:{},
                                                status:false,
                                                timestamp:Date.now(),
                                            })
                                        }else{
                                            console.log("成功");
                                            res.json({
                                                error:0,
                                                msg:"注册成功！",
                                                obj:{},
                                                status:true,
                                                timestamp:Date.now(),
                                            })
                                        }
                                    });
                                }
                                conn.release();
                            })
                        }
                    }
                });
            }
            conn.release();
        });

    }else{
        res.json({
            error:4,
            msg:"参数缺失！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }

    /*req.on("data",(buf)=>{
        var obj=qs.parse(buf.toString());
        console.log(obj);
    })*/
});
/**
 * 登录接口
 * 必填参数：
 * umail
 * upwd
 */
app.post(projectName+"/login"+"/login",(req,res)=>{
    console.log(req.body);
    var data=req.body;
    if(data.upwd && data.umail){
        pool.getConnection((err,conn)=>{
            if(err){
                res.json({
                    error:1,
                    msg:"从连接池获取连接失败！",
                    obj:{},
                    status:false,
                    timestamp:Date.now(),
                })
            }else{
                conn.query("SELECT * FROM jx_user WHERE userEmail = ? AND userPwd=?",[data.umail,data.upwd],(err,result)=>{
                    if(err){
                        console.log("sql语句执行失败！");
                        res.json({
                            error:2,
                            msg:"sql语句执行失败！",
                            obj:{},
                            status:false,
                            timestamp:Date.now(),
                        })
                    }else{
                        if(result.length>0){
                            req.session.user=result[0];
                            res.json({
                                error:0,
                                msg:"登录成功！",
                                obj:{
                                    token:uuidv1(),
                                    username:req.session.user.userName
                                },
                                status:true,
                                timestamp:Date.now(),
                            })
                        }else{
                           res.json({
                               error:5,
                               msg:"用户名或密码错误！",
                               obj:{},
                               status:false,
                               timestamp:Date.now(),
                           })
                        }
                    }

                });
            }
            conn.release();
        });

    }else{
        res.json({
            error:4,
            msg:"参数缺失！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }
});
/**
 * 校验登录状态接口
 */
app.get(projectName+"/test"+'/test',(req,res)=>{
    if(req.session.user){
        console.log("查找成功！");
        console.log(req.session.user);
        res.json({
            error:7,
            msg:"用户已登陆！",
            obj:{username:req.session.user.userName},
            status:true,
            timestamp:Date.now(),
        })
    }else{
        console.log("未查到session");
        res.json({
            error:6,
            msg:"用户未登陆！",
            obj:{},
            status:true,
            timestamp:Date.now(),
        })
    }
});
/**
 * 退出登录接口
 */
app.get(projectName+"/login"+'/logout',(req,res)=>{
    if(req.session.user){
        console.log("查找成功！");
        console.log(req.session.user);
        req.session.user=null;
        res.json({
            error:0,
            msg:"退出登录成功！",
            obj:{},
            status:true,
            timestamp:Date.now(),
        })
    }else{
        console.log("未查到session");
        res.json({
            error:6,
            msg:"用户未登陆！",
            obj:{},
            status:true,
            timestamp:Date.now(),
        })
    }
});
/**
 * bim项目提交接口
 */
app.post(projectName+'/socialPlatform'+'/socialPlatSubmit',(req,res)=>{
    console.log("---------访问上传路径-------------");

    /** When using the "single"
     data come in "req.file" regardless of the attribute "name". **/
    upload(req, res, function (err) {
        //添加错误处理
        if (err) {
            console.log(err);
            return;
        }

        if(req.session.user){
            var data=req.body;
            if(data.proClassify&&data.area&&data.proPurpose&&data.proType&&data.requirementType&&data.deliveryTime&&data.constructionScale&&data.unit&&data.basement&&data.cellQuantity&&data.softVendor&&data.describe&&req.files.length>0&&data.price){

                                    pool.getConnection((err,conn)=>{
                                        if(err){
                                            console.log("从连接池获取连接失败！");
                                            res.json({
                                                error:1,
                                                msg:"从连接池获取连接失败！",
                                                obj:{},
                                                status:false,
                                                timestamp:Date.now(),
                                            })
                                        }else{
                                            console.log("从连接池获取连接成功！");
                                            /*************生成文件路径************/
                                            var file_path="";
                                            req.files.forEach(function(file){
                                                req.file = file;
                                                var tmp_path = req.file.path;
                                                console.log(tmp_path);


                                                /** The original name of the uploaded file
                                                 stored in the variable "originalname". **/

                                                var target_path = '../binote-bim-work/uploads/' + req.file.originalname;
                                                if(req.file==req.files[req.files.length-1]){
                                                    file_path+='uploads/'+req.file.originalname;
                                                }else{
                                                    file_path+='uploads/'+req.file.originalname+",";
                                                }

                                                /** A better way to copy the uploaded file. **/


                                                if (!fs.existsSync('../binote-bim-work/uploads/')) {
                                                    fs.mkdirSync('../binote-bim-work/uploads/');
                                                }

                                  /*              var src = fs.createReadStream(tmp_path);
                                                var dest = fs.createWriteStream(target_path);*/
                                            });

                                            conn.query("INSERT INTO jx_pro VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,NULL,?)",[uuidv1(),req.session.user.userId,req.session.user.userName,req.session.user.userEmail,data.proClassify,data.area,data.proPurpose,data.proType,JSON.stringify({
                                                tujian:data.tujian,
                                                gangjin:data.gangjin,
                                                jipaipaishui:data.jipaipaishui,
                                                nuantongranqi:data.nuantongranqi,
                                                shineizhuangxiu:data.shineizhuangxiu,
                                                dianqixiaofang:data.dianqixiaofang,
                                                shizhenglvhua:data.shizhenglvhua,
                                                waiqiangzhuangxiu:data.waiqiangzhuangxiu,
                                            }),data.requirementType,data.deliveryTime,data.constructionScale,data.unit,data.basement,data.cellQuantity,data.softVendor=="其他"?data.project.softVendor:data.softVendor,data.describe,file_path,data.hasCAD=="on"?1:0,data.price,data.PROEXPLAIN,data.area+" |"+data.proType+"|"+data.proClassify+"|"+data.requirementType,moment().format('YYYY-MM-DD')],(err,result)=>{
                                                if(err){
                                                    console.log(err);
                                                    console.log("sql语句执行失败！");
                                                    res.json({
                                                        error:2,
                                                        msg:"sql语句执行失败！",
                                                        obj:{},
                                                        status:false,
                                                        timestamp:Date.now(),
                                                    })
                                                }else{
                                                    console.log("成功");
                                                    /******读写写文件操作********/
                                                    req.files.forEach(function(file){
                                                        req.file = file;
                                                        var tmp_path = req.file.path;
                                                        console.log(tmp_path);


                                                        /** The original name of the uploaded file
                                                         stored in the variable "originalname". **/

                                                        var target_path = '../binote-bim-work/uploads/' + req.file.originalname;
                                                        /** A better way to copy the uploaded file. **/


                                                        if (!fs.existsSync('../binote-bim-work/uploads/')) {
                                                            fs.mkdirSync('../binote-bim-work/uploads/');
                                                        }

                                                        var src = fs.createReadStream(tmp_path);
                                                        var dest = fs.createWriteStream(target_path);
                                                        src.pipe(dest);
                                                        src.on('end', function() {
                                                            res.json({
                                                                error:0,
                                                                msg:"提交成功！",
                                                                obj:{},
                                                                status:true,
                                                                timestamp:Date.now(),
                                                            })
                                                        });
                                                        src.on('error', function(err) {

                                                            res.json({
                                                                error:9,
                                                                msg:'文件上传失败！',
                                                                obj:{},
                                                                status:false,
                                                                timestamp:Date.now(),
                                                            });
                                                            console.log(err);
                                                        });
                                                        /*fs.unlinkSync(tmp_path, function(err){
                                                            console.log('=============');
                                                            console.log(file);
                                                            if(err){
                                                                throw err;
                                                            }
                                                            console.log('文件:'+tmp_path+'删除成功！');

                                                        });*/
                                                    });
                                                    emptyDir("upload")

                                                }

                                            });
                                        }
                                        conn.release();
                                    })
            }else{
                res.json({
                    error:4,
                    msg:"参数缺失！",
                    obj:{},
                    status:false,
                    timestamp:Date.now(),
                })
            }
        }else{
            console.log("未查到session");
            res.json({
                error:6,
                msg:"登录状态出错，请重新登录！",
                obj:{},
                status:false,
                timestamp:Date.now(),
            })
        }
    });



});
/**
 * 项目列表接口
 */
app.get(projectName+'/socialPlatform'+'/socialPlatform',(req,res)=>{
    var data=req.query;
    console.log(data);
    if(data.showCount&&data.currentPage){
        pool.getConnection((err,conn)=> {
            if (err) {
                res.json({
                    error: 1,
                    msg: "从连接池获取连接失败！",
                    obj: {},
                    status: false,
                    timestamp: Date.now(),
                })
            } else {
                // var area="",proClassify="";
                var sql="",
                    area="",
                    proClassify="";
                if(data.area){
                    area=" and `area`='"+data.area+"'";
                }else{
                    area=""
                }
                if(data.proClassify){
                    proClassify=" and proClassify='"+data.proClassify+"'";
                }else{
                    proClassify=""
                }
                sql="SELECT COUNT(*) FROM jx_pro WHERE  1=1"+area+"  " +proClassify;
                conn.query(sql,(err,result)=>{
                    conn.release();
                    console.log(result);
                    if(err){
                        console.log(err.sql);
                        console.log("sql语句执行失败！");
                        res.json({
                            error:2,
                            msg:"sql语句执行失败！",
                            obj:{},
                            status:false,
                            timestamp:Date.now(),
                        })
                    }else{
                        var totalResult=result[0]["COUNT(*)"],
                            totalPage=Math.ceil(totalResult/data.showCount);
                        pool.getConnection((err,conn)=> {
                            if (err) {
                                res.json({
                                    error: 1,
                                    msg: "从连接池获取连接失败！",
                                    obj: {},
                                    status: false,
                                    timestamp: Date.now(),
                                })
                            } else {
                                // var area="",proClassify="";
                                var sql="",
                                    area="",
                                    proClassify="";
                                if(data.area){
                                    area=" and `area`='"+data.area+"'";
                                }else{
                                    area=""
                                }
                                if(data.proClassify){
                                    proClassify=" and proClassify='"+data.proClassify+"'";
                                }else{
                                    proClassify=""
                                }
                                sql="SELECT state,proName,price,createTime,PROID FROM jx_pro WHERE  1=1"+area+"  "+proClassify+" ORDER BY createTime DESC limit ?,?";
                                conn.query(sql,[(data.currentPage-1)*data.showCount,parseInt(data.showCount) ],(err,result)=>{
                                    conn.release();
                                    console.log(result);
                                    if(err){
                                        console.log(err.sql);
                                        console.log("sql语句执行失败！");
                                        res.json({
                                            error:2,
                                            msg:"sql语句执行失败！",
                                            obj:{},
                                            status:false,
                                            timestamp:Date.now(),
                                        })
                                    }else{
                                        res.json({
                                            error:0,
                                            msg:"查询成功！",
                                            obj:{
                                                page:{
                                                    totalResult:totalResult,
                                                    totalPage:totalPage,
                                                    currentPage:data.currentPage,
                                                    showCount:data.showCount,
                                                },
                                                list:result,
                                            },
                                            status:true,
                                            timestamp:Date.now(),
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        });

    }else{
        res.json({
            error:4,
            msg:"参数缺失！",
            obj:{},
            status:true,
            timestamp:Date.now(),
        })
    }
});
/**
 * 项目详情接口
 */
app.get(projectName+'/socialPlatform'+'/detail',(req,res)=>{
    var data=req.query;
    console.log(data);
    if(data.PROID){
        pool.getConnection((err,conn)=> {
            if (err) {
                res.json({
                    error: 1,
                    msg: "从连接池获取连接失败！",
                    obj: {},
                    status: false,
                    timestamp: Date.now(),
                })
            } else {
                var sql="SELECT * FROM jx_pro WHERE  PROID=?";
                conn.query(sql, [data.PROID], (err, result) => {
                    conn.release();
                    console.log(result);
                    if (err) {
                        console.log(err.sql);
                        console.log("sql语句执行失败！");
                        res.json({
                            error: 2,
                            msg: "sql语句执行失败！",
                            obj: {},
                            status: false,
                            timestamp: Date.now(),
                        })
                    } else {
                        var detail=result[0];
                        pool.getConnection((err,conn)=> {
                            if (err) {
                                res.json({
                                    error: 1,
                                    msg: "从连接池获取连接失败！",
                                    obj: {},
                                    status: false,
                                    timestamp: Date.now(),
                                })
                            } else {
                                conn.query('select a.*, b.userId,b.userName,b.resumeUrl from jx_pro_user a join jx_user b on a.userId = b.userId WHERE a.PROID=?', [data.PROID], (err, result) => {
                                    conn.release();
                                    console.log(result);
                                    if (err) {
                                        console.log(err.sql);
                                        console.log("sql语句执行失败！");
                                        res.json({
                                            error: 2,
                                            msg: "sql语句执行失败！",
                                            obj: {},
                                            status: false,
                                            timestamp: Date.now(),
                                        })
                                    } else {
                                        detail.tenderList = result;

                                        res.json({
                                            error: 0,
                                            msg: "查询成功！",
                                            obj: {
                                                detail: detail,
                                                userId:req.session.user?req.session.user.userId:""
                                            },
                                            status: true,
                                            timestamp: Date.now(),
                                        });
                                    }
                                });

                            }
                        })
                    }
                })
            }
        })
    }else{
        {
            res.json({
                error:4,
                msg:"参数缺失！",
                obj:{},
                status:true,
                timestamp:Date.now(),
            })
        }
    }
});
/**
 * 投标接口
 */
app.post(projectName+'/socialPlatform'+'/tender',(req,res)=>{
    console.log(req.body);
    console.log(req.session.user);
    var data=req.body;
    if(req.session.user){
        if(req.session.user.resumeUrl) {
            if (data.PROID && data.manifesto) {
                pool.getConnection((err, conn) => {
                    if (err) {
                        res.json({
                            error: 1,
                            msg: "从连接池获取连接失败！",
                            obj: {},
                            status: false,
                            timestamp: Date.now(),
                        })
                    } else {
                        conn.query("SELECT * FROM jx_pro_user WHERE PROID = ? AND userId = ?", [data.PROID, req.session.user.userId], (err, result) => {
                            conn.release();
                            if (err) {
                                console.log("sql语句执行失败！");
                                res.json({
                                    error: 2,
                                    msg: "sql语句执行失败！",
                                    obj: {},
                                    status: false,
                                    timestamp: Date.now(),
                                })
                            } else {
                                if (result.length > 0) {
                                    res.json({
                                        error: 3,
                                        msg: "您已参与该项目投标！",
                                        obj: {},
                                        status: false,
                                        timestamp: Date.now(),
                                    })
                                } else {
                                    pool.getConnection((err, conn) => {
                                        if (err) {
                                            console.log("从连接池获取连接失败！");
                                            res.json({
                                                error: 1,
                                                msg: "从连接池获取连接失败！",
                                                obj: {},
                                                status: false,
                                                timestamp: Date.now(),
                                            })
                                        } else {
                                            console.log("从连接池获取连接成功！");
                                            conn.query("INSERT INTO jx_pro_user VALUES (?,?,?)", [req.session.user.userId, data.PROID, data.manifesto], (err, result) => {
                                                conn.release();
                                                if (err) {
                                                    console.log("sql语句执行失败！");
                                                    res.json({
                                                        error: 2,
                                                        msg: "sql语句执行失败！",
                                                        obj: {},
                                                        status: false,
                                                        timestamp: Date.now(),
                                                    })
                                                } else {
                                                    console.log("成功");
                                                    res.json({
                                                        error: 0,
                                                        msg: "投标成功！",
                                                        obj: {},
                                                        status: true,
                                                        timestamp: Date.now(),
                                                    })
                                                }
                                            });
                                        }

                                    })
                                }
                            }
                        });
                    }
                });

            } else {
                res.json({
                    error: 4,
                    msg: "参数缺失！",
                    obj: {},
                    status: true,
                    timestamp: Date.now(),
                })
            }
        }else{
            res.json({
                error:10,
                msg:"未提交简历，请前往个人中心提交简历后再参与投标！",
                obj:{},
                status:false,
                timestamp:Date.now(),
            })
        }
    }else{
        res.json({
            error:6,
            msg:"登录状态出错，请重新登录后再参与投标！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }
});
app.post(projectName+'/socialPlatform'+'/designate',(req,res)=>{
    console.log(req.body);
    console.log(req.session.user);
    var data=req.body;
    if(req.session.user){
        if(data.PROID && data.userId){
            pool.getConnection((err,conn)=>{
                if(err){
                    res.json({
                        error:1,
                        msg:"从连接池获取连接失败！",
                        obj:{},
                        status:false,
                        timestamp:Date.now(),
                    })
                }else{
                    conn.query("UPDATE jx_pro SET state=2 , tenderer=?  WHERE PROID=?",[req.session.user.userId,data.PROID],(err,result)=>{
                        conn.release();
                        if(err){
                            console.log("sql语句执行失败！");
                            res.json({
                                error:2,
                                msg:"sql语句执行失败！",
                                obj:{},
                                status:false,
                                timestamp:Date.now(),
                            })
                        }else{
                                res.json({
                                    error:0,
                                    msg:"成功！",
                                    obj:{},
                                    status:true,
                                    timestamp:Date.now(),
                                })

                        }
                    });
                }
            });

        }else{
            res.json({
                error:4,
                msg:"参数缺失！",
                obj:{},
                status:false,
                timestamp:Date.now(),
            })
        }

    }else{
        res.json({
            error:6,
            msg:"登录状态出错，请重新登录后再参与投标！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }
});
/**
 * 获取用户信息
 */
app.get(projectName+'/userCenter'+'/getInfo',(req,res)=>{
    if(req.session.user){
        var user=req.session.user;
            res.json({
                error:0,
                msg:"成功",
                obj:{
                    userInfo:{
                        userName:user.userName,
                        userEmail:user.userEmail,
                        userTel:user.userTel,
                        resumeUrl:user.resumeUrl
                    }
                },
                status:true,
                timestamp:Date.now(),
            })
    }else{
        res.json({
            error:6,
            msg:"登录状态出错，请重新登录！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }
});
app.post(projectName+'/userCenter'+'/editInfo',(req,res)=>{
    console.log("---------访问上传路径-------------");

    /** When using the "single"
     data come in "req.file" regardless of the attribute "name". **/
    upload(req, res, function (err) {
        //添加错误处理
        if (err) {
            console.log(err);
            return;
        }
        var data=req.body;
        if (data.userName && data.userEmail) {
        if(req.files && req.files.length>0){
            req.file = req.files[0];
            var tmp_path = req.file.path;
            console.log(tmp_path);

            /** The original name of the uploaded file
             stored in the variable "originalname". **/
            var target_path = '../binote-bim-work/uploads/' + req.file.originalname;
            var file_path='uploads/'+req.file.originalname;
            /** A better way to copy the uploaded file. **/
            console.log(target_path);


            if (!fs.existsSync('../binote-bim-work/uploads/')) {
                fs.mkdirSync('../binote-bim-work/uploads/');
            }
            pool.getConnection((err,conn)=>{
                if(err){
                    res.json({
                        error:1,
                        msg:"从连接池获取连接失败！",
                        obj:{},
                        status:false,
                        timestamp:Date.now(),
                    })
                }else{
                    var sql='UPDATE jx_user SET userName=? , userEmail=? , userTel=? ,resumeUrl=? WHERE userId=?';
                    conn.query(sql,[data.userName,data.userEmail,data.userTel,file_path,req.session.user.userId],(err,result)=>{
                        conn.release();
                        if(err){
                            console.log("sql语句执行失败！");
                            res.json({
                                error:2,
                                msg:"sql语句执行失败！",
                                obj:{},
                                status:false,
                                timestamp:Date.now(),
                            })
                        }else{
                            if(result.affectedRows>0){
                                req.session.user.userName=data.userName;
                                req.session.user.userEmail=data.userEmail;
                                req.session.user.userTel=data.userTel;
                                /*var oldUrl="../binote-bim-work"+req.session.user.resumeUrl;
                                fs.unlink(oldUrl,function (err) {
                                    if(err){
                                        console.log(err);
                                    }
                                });*/
                                req.session.user.resumeUrl=file_path;
                                var src = fs.createReadStream(tmp_path);
                                var dest = fs.createWriteStream(target_path);
                                src.pipe(dest);
                                src.on('end', function() {
                                    emptyDir("upload");
                                    res.json({
                                        error:0,
                                        msg:'修改成功！',
                                        obj:{},
                                        status:true,
                                        timestamp:Date.now(),
                                    })
                                });
                                src.on('error', function(err) {

                                    res.json({
                                        error:9,
                                        msg:'文件上传失败！',
                                        obj:{},
                                        status:false,
                                        timestamp:Date.now(),
                                    });
                                    console.log(err);
                                });

                            }else{
                                res.json({
                                    error:8,
                                    msg:'修改失败！',
                                    obj:{},
                                    status:false,
                                    timestamp:Date.now(),
                                })
                            }
                        }
                    })
                }
            });

        }else{
            pool.getConnection((err,conn)=>{
                if(err){
                    res.json({
                        error:1,
                        msg:"从连接池获取连接失败！",
                        obj:{},
                        status:false,
                        timestamp:Date.now(),
                    })
                }else{
                    var sql='UPDATE jx_user SET userName=? , userEmail=? , userTel=? WHERE userId=?';
                    conn.query(sql,[data.userName,data.userEmail,data.userTel,req.session.user.userId],(err,result)=>{
                        conn.release();
                        if(err){
                            console.log("sql语句执行失败！");
                            res.json({
                                error:2,
                                msg:"sql语句执行失败！",
                                obj:{},
                                status:false,
                                timestamp:Date.now(),
                            })
                        }else{
                            if(result.affectedRows>0){
                                req.session.user.userName=data.userName;
                                req.session.user.userEmail=data.userEmail;
                                req.session.user.userTel=data.userTel;
                                res.json({
                                    error:0,
                                    msg:'修改成功！',
                                    obj:{},
                                    status:true,
                                    timestamp:Date.now(),
                                })
                            }else{
                                res.json({
                                    error:8,
                                    msg:'修改失败！',
                                    obj:{},
                                    status:false,
                                    timestamp:Date.now(),
                                })
                            }
                        }
                    })
                }
            })
        }
        }else{
            res.json({
                error:4,
                msg:"参数缺失！",
                obj:{},
                status:false,
                timestamp:Date.now(),
            })
        }

    });
});
app.post(projectName+'/userCenter'+'/editPassword',(req,res)=> {
    var data = req.body;
    if (data.userPwd) {
        pool.getConnection((err, conn) => {
            if (err) {
                res.json({
                    error: 1,
                    msg: "从连接池获取连接失败！",
                    obj: {},
                    status: false,
                    timestamp: Date.now(),
                })
            } else {
                var sql = 'UPDATE jx_user SET userPwd=?  WHERE userId=?';
                conn.query(sql, [data.userPwd, req.session.user.userId], (err, result) => {
                    conn.release();
                    if (err) {
                        console.log("sql语句执行失败！");
                        res.json({
                            error: 2,
                            msg: "sql语句执行失败！",
                            obj: {},
                            status: false,
                            timestamp: Date.now(),
                        })
                    } else {
                        if (result.affectedRows > 0) {
                            res.json({
                                error: 0,
                                msg: '修改成功！',
                                obj: {},
                                status: true,
                                timestamp: Date.now(),
                            })
                        } else {
                            res.json({
                                error: 8,
                                msg: '修改失败！',
                                obj: {},
                                status: false,
                                timestamp: Date.now(),
                            })
                        }
                    }
                })
            }
        })
    }else{
        res.json({
            error:4,
            msg:"参数缺失！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }




});
app.get(projectName+'/userCenter'+'/employersList',(req,res)=>{
    if(req.session.user){
        pool.getConnection((err,conn)=> {
            if (err) {
                res.json({
                    error: 1,
                    msg: "从连接池获取连接失败！",
                    obj: {},
                    status: false,
                    timestamp: Date.now(),
                })
            } else {
                var sql="SELECT state,proName,price,createTime,PROID FROM jx_pro WHERE  userId=? ORDER BY createTime DESC ";
                conn.query(sql,[req.session.user.userId],(err,result)=>{
                    conn.release();
                    console.log(result);
                    if(err){
                        console.log(err.sql);
                        console.log("sql语句执行失败！");
                        res.json({
                            error:2,
                            msg:"sql语句执行失败！",
                            obj:{},
                            status:false,
                            timestamp:Date.now(),
                        })
                    }else{
                        res.json({
                            error:0,
                            msg:"查询成功！",
                            obj:{
                                list:result,
                            },
                            status:true,
                            timestamp:Date.now(),
                        })
                    }
                });

            }
        });
    }else{
        res.json({
            error:6,
            msg:"登录状态出错，请重新登录！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }
});
app.get(projectName+'/userCenter'+'/engineerList',(req,res)=>{
    if(req.session.user){
        pool.getConnection((err,conn)=> {
            if (err) {
                res.json({
                    error: 1,
                    msg: "从连接池获取连接失败！",
                    obj: {},
                    status: false,
                    timestamp: Date.now(),
                })
            } else {
                var sql="select a.*, b.* from jx_pro_user a join jx_pro b on a.PROID = b.PROID WHERE a.userId=? ORDER BY createTime DESC ";
                conn.query(sql,[req.session.user.userId],(err,result)=>{
                    conn.release();
                    console.log(result);
                    if(err){
                        console.log(err.sql);
                        console.log("sql语句执行失败！");
                        res.json({
                            error:2,
                            msg:"sql语句执行失败！",
                            obj:{},
                            status:false,
                            timestamp:Date.now(),
                        })
                    }else{
                        res.json({
                            error:0,
                            msg:"查询成功！",
                            obj:{
                                list:result,
                            },
                            status:true,
                            timestamp:Date.now(),
                        })
                    }
                });

            }
        });
    }else{
        res.json({
            error:6,
            msg:"登录状态出错，请重新登录！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
    }
});

/*********************************************************/
/*res.json({
    error:0,
    msg:"注册成功！",
    obj:{},
    status:true,
    timestamp:Date.now(),
})
res.json({
    error:1,
    msg:"从连接池获取连接失败！",
    obj:{},
    status:false,
    timestamp:Date.now(),
})
res.json({
    error:2,
    msg:"sql语句执行失败！",
    obj:{},
    status:false,
    timestamp:Date.now(),
})
res.json({
    error:3,
    msg:"该邮箱已注册，请登录或联系管理员修改密码！",
    obj:{},
    status:false,
    timestamp:Date.now(),
})
res.json({
    error:4,
    msg:"参数缺失！",
    obj:{},
    status:true,
    timestamp:Date.now(),
})
res.json({
            error:5,
            msg:"用户名或密码错误！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
        res.json({
            error:6,
            msg:"用户未登陆！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })
        res.json({
            error:7,
            msg:"用户已登陆！",
            obj:{},
            status:false,
            timestamp:Date.now(),
        })*/
// fs.unlink("upload\\1afaf5dba68ce889dc0b1f0bd5cc6e4b", function(err){
//     console.log('=============');
//     // console.log(file);
//     if(err){
//         // throw err
//         console.log(err)
//     }
//     // console.log('文件:'+tmp_path+'删除成功！');
//
// });
var emptyDir = function(fileUrl){

    var files = fs.readdirSync(fileUrl);//读取该文件夹

    files.forEach(function(file){

        var stats = fs.statSync(fileUrl+'/'+file);

        if(stats.isDirectory()){

            emptyDir(fileUrl+'/'+file);

        }else{

            fs.unlinkSync(fileUrl+'/'+file);

            console.log("删除文件"+fileUrl+'/'+file+"成功");

        }

    });

};

