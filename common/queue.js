const async = require('async')

let len = 1;

class Queue{
    constructor(name, maxLength = 10){
        this.name = name || len++;
        this.async = async;
        this.maxLength = maxLength
        this.bind();
    }

    bind(){
        this.async = this.async.queue((obj, callback) => {
            obj.fn.apply(this, obj.params).then(async res => {
                obj.success && obj.success.apply(this, [res]);
                await callback();
            }).catch(async err => {
                obj.error && obj.error.apply(this, [err]);
                await callback(err);
            })
        }, this.maxLength);
    }

    push(obj){
        this.async.push(obj, (err) => {
            if(err)
                console.log('运行 ' + this.name + ' 队列时发生错误: ' + err + '，错误时间: ' + new Date());
        })
    }

    get length(){
        return this.async.length();
    }

    end(fn){
        this.async.drain(() => {
            let date = new Date();
            console.log(`队列 ${this.name} 执行完毕, 完成时间: ` + date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
            fn();
        });
    }
}

module.exports = Queue;