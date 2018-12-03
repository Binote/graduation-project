var sdxCommon = function() {

  var apiCookies = Cookies.noConflict();
  // var apiRoot = "http://test.sindrax.com/mis";
  //  var apiRoot = "http://api.sindrax.com/mis";
   // var apiRoot = "http://192.168.1.43:8080";
  // var apiRoot = "http://192.168.1.72:8080/sindraxApiMaven";
  // var apiRoot = "http://192.168.10.68:8080/sindraxApiMaven";
 // var apiRoot = "http://192.168.1.12:8080/sindrax_mis";
    var apiRoot="http://127.0.0.1:8080";
 //    var apiRoot="http://47.100.60.48:8080";
  var apiSubfix = "?token=" + apiCookies.get("apiToken");
  var username=apiCookies.get("username");
  var rootSpace={};
  var prev=apiCookies.get("prev");
  var defaultPageSize = 15;
  var PROTYPRID="c4bf6bf33f5b4438aad90f1634ea453b";//测试数据库联营id
    var domain= "uploadpic.sindrax.com";

  var paymentList = {
    "manual": "人工付款",
    "full": "全款",
    "prepayment": "预付款",
    "credit": "赊账"
  };
  var invoiceList = {
    "none": "无发票",
    "plain": "普通发票",
    "vat_pt": "增值税普通发票",
    "vat_zy": "增值税专用发票"
  };
  var provinceList = {
    "安徽省": "安徽省",
    "北京市": "北京市",
    "重庆市": "重庆市",
    "福建省": "福建省",
    "甘肃省": "甘肃省",
    "广东省": "广东省",
    "广西壮族自治区": "广西壮族自治区",
    "贵州省": "贵州省",
    "海南省": "海南省",
    "河北省": "河北省",
    "河南省": "河南省",
    "黑龙江省": "黑龙江省",
    "湖北省": "湖北省",
    "湖南省": "湖南省",
    "江苏省": "江苏省",
    "江西省": "江西省",
    "吉林省": "吉林省",
    "辽宁省": "辽宁省",
    "内蒙古自治区": "内蒙古自治区",
    "宁夏回族自治区": "宁夏回族自治区",
    "青海省": "青海省",
    "山东省": "山东省",
    "上海市": "上海市",
    "陕西省": "陕西省",
    "山西省": "山西省",
    "四川省": "四川省",
    "天津市": "天津市",
    "新疆维吾尔自治区": "新疆维吾尔自治区",
    "西藏自治区": "西藏自治区",
    "云南省": "云南省",
    "浙江省": "浙江省",
    "香港特别行政区": "香港特别行政区",
    "澳门特别行政区": "澳门特别行政区",
    "台湾省": "台湾省"
  };
  var materialList = {
    "prj": "投影机",
    "ops": "主机",
    "aio": "一体机",
    "ttb": "触摸桌",
    "net": "网络设备",
    "hdm": "视频线材",
    "ied": "感应设备",
    "oth": "其他"
  };
  var logout = function() {
    window.location = "/apps/auth/login.html"
  };

  return {
    apiRoot: apiRoot,
    apiSubfix: apiSubfix,
    apiCookies: apiCookies,
      PROTYPRID:PROTYPRID,
      domain:domain,

    logout: logout,
    logoutConfirm: function() {
      swal({
        title: "",
        text: "是否确定注销当前登录账号并退出系统？",
        type: "warning",
        showCancelButton: true,
        cancelButtonText: "取消，继续使用",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "确认注销并退出",
        closeOnConfirm: false,
        allowEscapeKey: false
      }, logout);
    },

    tokenExpired: function() {
      swal({
        title: "",
        text: "登陆状态过期，需要重新登陆来继续使用系统功能……",
        type: "error",
        closeOnConfirm: false,
        allowEscapeKey: false
      }, logout);
    },

    throwError: function(data) {
      var errorCode = -1;
      if (data.status != null && data.status != undefined) {
        errorCode = data.status;
      } else {
        if (data != null && data != undefined) {
          errorCode = data;
        } else {
          errorCode = 500;
        }
      }
      apiCookies.set("errorCode", errorCode);
      throw errorCode;
    },
    requestFail: function() {
      swal("", "提交请求失败，请稍检查网络连接后重试！", "error");
    },

    blockAjaxLoad: function() {
      App.blockUI({
        target: '.page-content',
        boxed: !0,
        message: '正在发送请求，等待服务器返回数据……'
      });
    },
    unblockAjaxLoad: function() {
      App.unblockUI('.page-content');
    },

    blockAlert: function(title, message) {
      swal({
        "title": title,
        "text": message == undefined ? "正在加载……请稍后" : message,
        "showConfirmButton": false,
        "allowEscapeKey": false,
      });
    },

    ajaxLoad: function(url, settings) {
      var settingObj = settings;
      $.ajax({
        "url": url,
        "method": settingObj.method == undefined ? "get" : settingObj.method,
        "contentType": settingObj.contentType == undefined ? "application/x-www-form-urlencoded; charset=UTF-8" : settingObj.contentType,
        "data": settingObj.data == undefined ? null : settingObj.data,
        "beforeSend": sdxCommon.blockAjaxLoad,
        "success": function(data, textStatus, xhr) {
          sdxCommon.ajaxMidProc(data, textStatus, xhr, settingObj.success, settingObj.fail, settingObj.final);
        },
      }).fail(sdxCommon.throwError).always(sdxCommon.unblockAjaxLoad);
    },

    ajaxMidProc: function(data, textStatus, xhr, successHandler, failHandler, finalHandler) {
      if (data.status) {
        if (successHandler != null && successHandler != undefined) {
          successHandler(data, textStatus, xhr);
        }
      } else {
        switch (data.error) {
          case 1001:
            sdxCommon.tokenExpired();
            break;
          default:
            if (failHandler != null && failHandler != undefined) {
              failHandler(data, textStatus, xhr);
            }
            break;
        }
      }
      if (finalHandler != null && finalHandler != undefined) {
        finalHandler(data, textStatus, xhr);
      }
    },

    defaultPageSize: defaultPageSize,
    paymentList: paymentList,
    provinceList: provinceList,
    invoiceList: invoiceList,
    materialList: materialList,
    initSelector: function(selector, list, className) {
      $(selector + " ." + className).remove();
      var selectorObj = $(selector);
      $.each(list, function(key, value) {
        selectorObj.append('<option class="' + className + '" value="' + key + '">' + value + '</option>');
      });
    },

    init: function() {
      $('.ajax-link').on('click', function() {
        Layout.loadAjaxContent($(this).attr('data-link'));
      });
    },
      username:username,
      rootSpace:rootSpace,
      prev:prev,


  }
}();

/*jQuery(document).ready(function() {
  window.onerror = function(message, source, lineno, colno, error) {
    var errorCode = sdxCommon.apiCookies.get("errorCode");
    if (errorCode == null || errorCode == undefined) {
      sdxCommon.apiCookies.set("errorCode", 500);
    }
    if (typeof(Layout) != "undefined") {
      Layout.loadAjaxContent("/apps/error/function.html");
    } else {
      swal("", "页面发生错误，请刷新后重试……", "error");
    }
  };
});*/
$.fn.serializeObject=function(){
    var obj=new Object();
    $.each(this.serializeArray(),function(index,param){
        if(!(param.name in obj)){
            if(param.name==="allfenchenMoney" && param.value===""){

            }else{

                obj[param.name]=param.value;
            }
        }
    });
    return obj;
};
$.fn.mainLoad=function () {
  var href=$(this).attr("data-href");
    $("#body-container").load(href);
};