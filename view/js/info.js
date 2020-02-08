new Vue({
    el: '#app',
    data: {
        errors: [],
        infos: [],
        data: {},
        personNumber: 0
    },
    computed: {
        lastChapter(){
            return this.data.list[this.data.list.length - 1];
        }
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
                key: this.data.originkey,
                bookTitle: this.data.title,
                author: this.data.author,
            }

            return `/chapter.html?${toStr(data)}`;
        }
    },
    mounted(){
        let searchData = toObj(location.search);
        this.searchData = searchData;
        if(searchData.href && searchData.key){
            this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
            this.bindIo();

            this.io.on('connect', res => {
                axios.get('chapter/list', {
                    params: {
                        href: searchData.href,
                        origin: searchData.key,
                        socketId: this.io.id
                    }
                }).then(res => {
                    let data = res.data.data;
                    this.data = data;
                    document.title = this.data.title + ' - lionet';
                    setTimeout(() => {
                        this.infos = [];
                    }, 500);

                    // 添加历史记录
                    data.bookHref = this.searchData.href;
                    addBookData(data)
                })
            })
        } else {
            this.errors.push('没有href/key参数');
        }
    }
})