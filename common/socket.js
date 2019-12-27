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
            this.users[client.id] = client;

            this.webNumber();

            client.on('disconnect', () => {
                delete this.users[client.id];
                this.webNumber();
            })
        });
        server.listen(socket.port);
    }

    webNumber(){
        this.emit('webPersonNumber', Object.keys(this.users).length);
    }

    emit(name, data, id){
        let conn = id ? this.users[id] : this.io;
        conn.emit(name, data);
    }
}

let ws = new Socket();

module.exports = ws;