//功能点1：页面加载完，异步请求页头和页尾
$('#header').load('tpl/header.html', function(){
    //页头已经异步加载完成，挂载到DOM树

});
$('#footer').load('tpl/footer.html');