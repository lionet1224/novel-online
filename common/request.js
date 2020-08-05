const { request, userAgent } = require("../config");
const iconv = require('iconv-lite')
const rq = require('request')
const redis = require('./redis')

let flag  = false;

function getProxy(){
    if(request.proxyUri == '' || !request.proxyUri) return;
    return new Promise(async (resolve, reject) => {
        let cache = await redis.get('data', 'proxyData');
        let data = [];
        if(cache && cache != 'undefined' && cache != undefined){
            data = JSON.parse(cache);
            if(data.length <= 0) await redis.del('data', 'proxyData')
        } else if(!flag){
            flag = true;
            data = await req({
                uri: request.proxyUri,
                transform(body){
                    let result = null;
                    try{
                        result = JSON.parse(iconv.decode(body, "utf-8"));
                    } catch(err){
                        console.log('错误: ' + err);
                    }
                    return result;
                }
            }, false)
            flag = false;
            data = data ? data.data : [];
        }

        if(data.length >= 1){
            await redis.set("data", "proxyData", JSON.stringify(data), 60 * 5);
            let proxy = data[~~(data.length * Math.random())];
            if (proxy) proxy = "http://" + proxy.ip + ":" + proxy.port;
            resolve(proxy);
        } else {
            resolve(null)
        }
    })
}

function req(config = {}, proxy = true){
    return new Promise(async (resolve, reject) => {
        let proxyUri;
        // if(proxy) proxyUri = await getProxy();
        config = Object.assign(config, request);
        // proxyUri && (config.proxy = proxyUri);
        if(!config.uri || config.uri == "") return;
        let prefix = config.uri.slice(0, 4);
        if(prefix != 'http') config.uri = 'http://' + config.uri;
        
        let agent = userAgent[config.agent || 'pc'];
        config.headers['User-Agent'] = agent[Math.floor(agent.length * Math.random())];
        rq(config, (err, res, body) => {
            if(err){
                return reject(err);
            }
            resolve(config.transform ? config.transform(body, res) : body);
        })
    });
};

module.exports = req;