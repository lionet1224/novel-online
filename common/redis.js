const { redis } = require('../config');
const r = require('redis')

class Redis {
    constructor() {
        this.datas = {};
        this.use = redis.use;
    }

    load(key, data) {
        this.datas[key] = data;
        this.bind(key, data);
    }

    bind(key, data) {
        data.auth(redis.pwd, () => {
            console.log('redis ' + key + ' 验证成功');
        })
        data.on('error', err => {
            console.error('redis ' + key + ' 错误: ' + err);
        })
    }

    getData(key) {
        return this.datas[key];
    }

    set(dataKey, key, val, expire) {
        if(!this.use) return false;
        return new Promise(async (resolve, reject) => {
            let client = this.getData(dataKey);
            client.set(key, val, async () => {
                expire && await this.expire(dataKey, key, expire);
                resolve();
            });
        })
    }

    get(dataKey, key) {
        if(!this.use) return false;
        return new Promise(async (resolve, reject) => {
            let client = this.getData(dataKey);
            await client.get(key, (err, res) => {
                if(err) reject(err)
                else resolve(res);
            });
        })
    }

    sadd(dataKey, key, val, expire) {
        if(!this.use) return false;
        return new Promise(async (resolve, reject) => {
            let client = this.getData(dataKey);
            await client.sadd(key, val);
            if (expire) await this.expire(dataKey, key, expire);
            resolve();
        })
    }

    sget(dataKey, key) {
        if(!this.use) return false;
        return new Promise((resolve, reject) => {
            let client = this.getData(dataKey);
            client.smembers(key, (err, replay) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(replay);
                }
            })
        })
    }

    shas(dataKey, key, val) {
        if(!this.use) return false;
        return new Promise((resolve, reject) => {
            let client = this.getData(dataKey);
            client.sismember(key, val, (err, replay) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(replay);
                }
            });
        })
    }

    del(dataKey, key) {
        if(!this.use) return false;
        return new Promise(async (resolve, reject) => {
            let client = this.getData(dataKey);
            client.del(key, () => {
                resolve();
            });
        })
    }

    expire(dataKey, key, expire) {
        if(!this.use) return false;
        return new Promise(async (resolve, reject) => {
            let client = this.getData(dataKey);
            await client.expire(key, expire);
            resolve();
        })
    }
}

// 数据保存
const clientData = r.createClient({
    port: redis.port,
    host: redis.host,
    password: redis.pwd,
    db: 1
});
let data = new Redis;
data.load('data', clientData);

module.exports = data;