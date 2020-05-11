import config from './config'
import {
	toObj,
	toStr,
	getSet,
	getId,
	getBookData,
	setBookData,
	addBookData,
	updateBookData,
    loadFont,
    userTestToken,
    findBookshelf,
    storeBookShelf,
    deleteBookshelf,
    bottomBarBind
} from './tool'
import '../style/bootstrap.css'
import '../style/style.css'

window.onload = () => {
new Vue({
    el: '#app',
    data: {
        errors: [],
        infos: [],
        data: {},
        personNumber: 0,

        order: 'asc',
        isStore: true
    },
    computed: {
        lastChapter(){
            return this.data.list[this.data.list.length - 1] || {};
        }
    },
    methods: {
        bindIo(fn){
            this.id = getId();
            this.io.emit('conn', this.id);
            this.io.on('conn', msg => {
                console.log(msg)
                fn.call(this);
                this.io.on('infoMsg', res => {
                    this.infos.push(res);
                })
                this.io.on('errorsMsg', msg => {
                    this.errors.push(msg);
                })
                this.io.on('webPersonNumber', res => {
                    this.personNumber = res;
                })
            })
        },
        getChapter(href){
            let data = {
                href,
                key: this.data.originkey,
                bookTitle: this.data.title,
                author: this.data.author,
                originHref: this.searchData.href
            }

            return `/chapter.html?${toStr(data)}`;
        },
		getChapterHrefClick(href, title){
			updateBookData({
				title,
				href,
				bookTitle: this.data.title,
				author: this.data.author,
				origin: this.data.originkey,
                originHref: this.searchData.href
			});
		},
        updateOrder(type){
            if(type == this.order) return;
            this.data.list = this.data.list.reverse()
            this.order = type;
        },
        addBookshelf(){
            if(this.isStore){
                deleteBookshelf(
                    this.data.title, 
                    this.searchData.href,
                    this.data.author,
                    this.data.originkey
                ).then(res => {
                    this.isStore = false;
                })
            } else {
                storeBookShelf(
                    this.data.title, 
                    this.searchData.href,
                    this.data.imageUrl,
                    this.data.author,
                    this.data.originkey
                ).then(res => {
                    this.isStore = true;
                })
            }
        }
    },
    mounted(){
        let searchData = toObj(location.search);
        this.searchData = searchData;
        if(searchData.href && searchData.key){
            this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
            this.bindIo(() => {
                axios.get('chapter/list', {
                    params: {
                        href: searchData.href,
                        origin: searchData.key,
                        socketId: this.id
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

                    // 判断是否登录
                    userTestToken().then(res => {
                        findBookshelf(
                            this.data.title,
                            this.searchData.href,
                            this.data.author,
                            this.data.originkey,
                        ).then(res => {
                            this.isStore = res.data.data.flag;
                        })
                    })
                })
            });
        } else {
            this.errors.push('没有href/key参数');
        }
        
        $(document).scroll(() => {
            let top = $('html, body').scrollTop();
            if(top >= 500){
                $('.top').show();
            } else {
                $('.top').hide();
            }
        })
		$('.top').click(() => {
			$('html, body').scrollTop(0)
        })
        
        loadFont();
        bottomBarBind();
    }
})
}