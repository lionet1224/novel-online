const { socket } = require('../config');
const server = require('http').createServer();
const io = require('socket.io')(server);

class Socket{
    constructor(){
        this.io = io;
        this.users = {};
        this.listen();
    }

    listen(){
        this.io.on('connection', client => {
            client.on('conn', (id) => {
                this.users[id] = client;
                this.emit('conn', '链接成功', id);
                this.webNumber();
            })
            // this.users[client.id] = client;

            client.on('disconnect', () => {
                delete this.users[client.id];
                this.webNumber();
            })
        });
        server.listen(socket.port, () => {
            console.log(`成功启动socket服务 :${socket.port}`)
        });
    }

    webNumber(){
        this.emit('webPersonNumber', Object.keys(this.users).length);
    }

    emit(name, data, id){
        if(id && !this.users[id]) return;
        let conn = id ? this.users[id] : this.io;
        conn.emit(name, data);
    }
}

let ws = new Socket();

module.exports = ws;