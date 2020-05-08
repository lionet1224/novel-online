const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    app: [
      "@babel/polyfill",
      path.resolve(__dirname,'view/js/app.js'),
    ],
    chapter: [
      "@babel/polyfill",
      path.resolve(__dirname,'view/js/chapter.js'),
    ],
    info: [
      "@babel/polyfill",
      path.resolve(__dirname,'view/js/info.js'),
    ]
  },    // 入口文件
  output: {
    filename: '[name].[hash:8].js',      // 打包后的文件名称
    path: path.resolve(__dirname,'view/dist')  // 打包后的目录
  },
  module:{
    rules:[
      {
        test:/\.css$/,
        use:['style-loader','css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: [require('autoprefixer')]
          }
        }] // 从右向左解析原则
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, // 字体
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 0,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test:/\.js$/,
        use:{
          loader:'babel-loader',
          options:{
            presets:['@babel/preset-env']
          }
        },
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'view/index.html'),
      filename: 'index.html',
      chunks: ['app'],
      minify: { // 压缩HTML文件
        removeComments: true, // 移除HTML中的注释
        minifyCSS: true// 压缩内联css
      },
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'view/chapter.html'),
      filename: 'chapter.html',
      chunks: ['chapter'],
      minify: { // 压缩HTML文件
        removeComments: true, // 移除HTML中的注释
        minifyCSS: true// 压缩内联css
      },
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'view/info.html'),
      filename: 'info.html',
      chunks: ['info'],
      minify: { // 压缩HTML文件
        removeComments: true, // 移除HTML中的注释
        minifyCSS: true// 压缩内联css
      },
      inject: 'head'
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: './view/lib/',
      to: 'lib'
    }])
  ]
}