new Vue({
    el: '#app',
    data: {
        errors: [],
        infos: [],
        data: {},
        key: ''
    },
    computed: {
        prevHref(){
            return '/chapter.html?' + toStr({
                href: this.data.prevHref,
                key: this.key
            })
        },
        nextHref(){
            return '/chapter.html?' + toStr({
                href: this.data.nextHref,
                key: this.key
            })
        },
    },
    methods: {
        bindIo(){
            this.io.on('infoMsg', res => {
                this.infos.push(res);
            })
            this.io.on('errorsMsg', msg => {
                this.errors.push(msg);
            })
        },
        getChapter(href){
            let data = {
                href,
                origin: this.key
            }
            data.socketId = this.io.id;
            this.data = {};
            
            axios.get('chapter', {
                params: data
            }).then(res => {
                let data = res.data;
                this.data = data.data;
                document.title = this.data.title + ' - lionet';
                setTimeout(() => {
                    this.infos = [];
                }, 500);
            })
        },
        clearChapter(){
            axios.delete('chapter', {
                params: {
                    href: this.href
                }
            }).then(res => {
                alert('删除成功');
            })
        }
    },
    mounted(){
        let data = toObj(location.search);
        if(data.href && data.key){
            this.key = data.key;
            this.href = data.href;
            this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
            this.bindIo();

            this.io.on('connect', res => {
                this.getChapter(data.href);
            })
        } else {
            this.errors.push('没有href/key参数');
        }
    }
})