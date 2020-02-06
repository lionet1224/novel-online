# 安装使用

```shell
// 安装依赖
npm install
// 启动服务
npm run start
```

然后在页面中打开`127.0.0.1`/`localhost`即可进入页面

> 1.0.3 - 因为程序还使用了redis，所以还需要启动一下redis服务

# 配置说明

在`config/`文件夹中可以看到所有的配置文件，其中可以在`redis.js`文件中将`use`属性改为`true`来开启redis服务。

`origin.js`是所有的来源配置。

`server.js`是服务地址的配置，如端口和host。

其他的就没有什么好介绍的了。

# 更新日志

## 1.0.4

* 默认redis服务关闭
* 将a标签的`href="#"`改为`href="javascript:void(0)"`

## 1.0.3

* 将font文件删除

# 重要说明

* 这个项目仅供学习使用！