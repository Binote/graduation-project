//功能点1：页面加载完，异步请求页头和页尾
$('#header').load('/application/tpl/header.html');
$('#footer').load('/application/tpl/footer.html');
if(sdxCommon.prev){
    $("#body-container").load(sdxCommon.prev);
}else{
    $("#body-container").load('/application/index/index.html');
}
var notNull=function (str) {
    if(str){
        return str;
    }else{
        return "";
    }
};


