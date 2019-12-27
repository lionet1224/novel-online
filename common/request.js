const { request, userAgent } = require('../config')
const rq = require('request')

module.exports = (config = {}) => {
    return new Promise((resolve, reject) => {
        config = Object.assign(config, request);
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