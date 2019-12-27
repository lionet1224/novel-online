new Vue({
    el: '#app',
    data: {
        errors: [],
        infos: [],
        data: {},
        personNumber: 0
    },
    methods: {
        bindIo(){
            this.io.on('infoMsg', res => {
                this.infos.push(res);
            })
            this.io.on('errorsMsg', msg => {
                this.errors.push(msg);
            })
            this.io.on('webPersonNumber', res => {
                this.personNumber = res;
            })
        },
        getChapter(href){
            let data = {
                href,
                key: this.data.originkey
            }

            window.open(`/chapter.html?${toStr(data)}`);
        }
    },
    mounted(){
        let data = toObj(location.search);
        if(data.href && data.key){
            this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
            this.bindIo();

            this.io.on('connect', res => {
                axios.get('chapter/list', {
                    params: {
                        href: data.href,
                        origin: data.key,
                        socketId: this.io.id
                    }
                }).then(res => {
                    let data = res.data.data;
                    this.data = data;
                    document.title = this.data.title + ' - lionet';
                    setTimeout(() => {
                        this.infos = [];
                    }, 500);
                })
            })
        } else {
            this.errors.push('没有href/key参数');
        }
    }
})