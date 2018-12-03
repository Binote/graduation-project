# 新爵科技CMDB前端代码

### 调试及预览

由于前端代码需要调用一部分资源文件，需要提供HTTP服务。建议在拉取最新代码后在本地执行以下命令：

```shell
cd [project path]
python -m SimpleHTTPServer 8000
```

[预览及调试地址: http://127.0.0.1:8000](http://127.0.0.1:8000)

### API Mock

针对尚未开发完成的API接口，可以使用[apiary](https://www.apiary.io/)进行模拟。

### 目录结构

```
└───assets: 资源目录
|	└───plugins: 插件资源
|	|	jquery.min.js
|	|	└───bootstrap
|	└───global: 全局资源
|	|	└───styles: 全局样式表
|	|	└───scripts: 全局脚本
|	|	└───images: 全局图片
|	└───apps: 应用资源
|	|	└───error
|	|	|	└───images: 应用图片
|	|	|    style.css: 应用样式表
|	|	|    init.js: 应用脚本
|	|	└───auth
└───apps: 应用页面
|	└───error
|	└───auth
|	|	login.html: 登陆页面
index.html: 主框架页面
```

### 第三方插件及类库的使用

类库文件存放路径为\assests\plugins，如无需改动仅保留最小化后的样式表和脚本，具体格式为\*.min.css或\*.min.js。

### 代码文件签入

请详细填写签入说明，不要提交空说明的签入请求！

