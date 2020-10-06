const { reject } = require("async");

const { Rq, cheerio, iconv, Queue, Dom, checkReplite, redis, ws, isURL } = require(global.ROOTPATH + '/common')
const { origin } = require(global.ROOTPATH + '/config')

function sendMsg(id, msg){
    if(!id) return;
    ws.emit('infoMsg', msg, id);
}
function sendErrorsMsg(id, msg){
    if(!id) return;
    ws.emit('errorsMsg', msg, id);
}

function getChapter(uri, replite, socketId){
    let dom = new Dom(replite);
    return new Promise((resolve, reject) => {
        sendMsg(socketId, '正在请求网页...');
        if(!dom.isCorreryUri(uri)) {
            sendMsg(socketId, '错误的地址...');
            reject();
            return;
        }
        Rq({
            uri,
            transform(body, res){
                return dom.transform(body);
            }
        })
        .then($ => {
            sendMsg(socketId, '开始解析页面...');
            dom.load($);
            let data = dom.getChapter(uri);
            sendMsg(socketId, '解析完毕...');
            resolve(data);
        })
        .catch(err => {
            console.error(`获取章节出错, 路径：${uri}, 错误: ${err}`);
            sendErrorsMsg(socketId, '获取章节出错, 错误代码：' + (err.code || err));
            reject();
        })
    })
}

module.exports = (href, key, socketId) => {
    return new Promise(async (resolve, reject) => {
        sendMsg(socketId, '正确进入执行函数中...');
        sendMsg(socketId, '判断参数是否正确...');
        if(!href || !isURL(href) ){
            sendErrorsMsg(socketId, '错误的地址');
            resolve({});
            return;
        }
        sendMsg(socketId, '判断是否有缓存...');
        let redisData = await redis.get('data', 'chapter-' + href);
        if(redisData){
            sendMsg(socketId, '返回缓存数据...');
            let data = JSON.parse(redisData);
            data.cache = true;
            resolve(data);
            return;
        }

        let data = await getChapter(href, origin[key], socketId);
        // 缓存数据一个月
        await redis.set('data', 'chapter-' + href, JSON.stringify(data), 60 * 60);

        sendMsg(socketId, '返回数据...');
        resolve(data);
    })
}