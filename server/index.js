const { server } = require('../config')
const { path } = require('../common')
const router = require('./router')
const static = require('koa-static')
const Koa = require('koa2');
const bodyParser = require('koa-bodyparser')
const app = new Koa();

app.use(static(path.join(global.ROOTPATH, './view/dist')))
app.use(bodyParser());

class Server{
    constructor(){
        this.port = server.port;
        this.app = app;
        this.router = router;
    }

    start(){
        this.app
            .use(this.router.routes())
            .use(this.router.allowedMethods())

        this.app.listen(this.port, () => {
            console.log(`Koa服务已启动，打开地址: http://${server.host}:${server.port}`)
        });
    }
}

module.exports = Server;