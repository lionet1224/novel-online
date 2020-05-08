# 安装使用

```shell
// 安装依赖
npm install
// 打包前端文件
npm run build
// 启动服务
npm run start
```

然后在页面中打开`127.0.0.1`/`localhost`即可进入页面, 默认端口为81, 需要更改可以在`config/server.js`。

# 配置说明

在`config/`文件夹中可以看到所有的配置文件，其中可以在`redis.js`文件中将`use`属性改为`false`来关闭redis服务。

`origin.js`是所有的来源配置。

`server.js`是服务地址的配置，如端口和host。

# 更新日志

## 1.0.8

* add: 使用webpack打包资源
* fix: 修复点击当前章节无法跳转到对应位置

## 1.0.7

* add: 增加排序章节列表功能
* add: 获取全小说来源的章节没有上下间隙的问题
* add: 章节页面增加章节列表查看，阅读配置
* add: 自动加载下一章
* update: 优化首页搜索到的书籍详情

## 1.0.6

* add: 详情页访问过的章节区别展示
* update: 章节页面内容宽度调整
* update: 详情页手机端展示调整
* update: 详情页最新章节更新为链接
* update: 首页样式调整
* update: 历史记录更改为阅读记录
* update: 修改解析origin数据的方式，之前的`attrhref`改为`attr-*(href)`
* fix: 历史记录点击书籍名称无法正确跳转

## 1.0.5

* add: 历史记录功能
* add: 到达最终章的显示效果
* add: 章节字数统计
* update: 对这个工具的介绍
* update: 章节页面展示效果修改

## 1.0.4

* add: 搜索错误后的提示
* update: 将a标签的`href="#"`改为`href="javascript:void(0)"`

## 1.0.3

* delete: 将font文件删除

# 重要说明

**这个项目仅供学习交流使用！不允许使用本工具进行任何违法行为！**