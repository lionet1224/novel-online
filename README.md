# 安装使用

```shell
// 安装依赖
npm install
// 启动服务
npm run start
```

然后在页面中打开`127.0.0.1`/`localhost`即可进入页面

> 因为程序还使用了redis，所以还需要启动一下redis服务

# 配置说明

在`config/`文件夹中可以看到所有的配置文件，其中可以在`redis.js`文件中将`use`属性改为`false`来关闭redis服务。

`origin.js`是所有的来源配置。

`server.js`是服务地址的配置，如端口和host。

# 更新日志

## 1.0.6 - 开发中

* add: 详情页访问过的章节区别展示
* update: 章节页面内容宽度调整
* update: 详情页手机端展示调整
* update: 详情页最新章节更新为链接
* fix: 历史记录点击书籍名称无法正确跳转

## 1.0.5

* add: 历史记录功能
* add: 到达最终章的显示效果
* add: 章节字数统计
* update: 对这个网站的介绍
* update: 章节页面展示效果修改

## 1.0.4

* add: 搜索错误后的提示
* update: 将a标签的`href="#"`改为`href="javascript:void(0)"`

## 1.0.3

* delete: 将font文件删除

# 重要说明

* 这个项目仅供学习使用！