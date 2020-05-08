import Vue from './vue'
import axios from './axios'
import config from './config'
import io from './socket.io'
import {
	toObj,
	toStr,
	getSet,
	getId,
	getBookData,
	setBookData,
	addBookData,
	updateBookData
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

        order: 'asc'
    },
    computed: {
        lastChapter(){
            return this.data.list[this.data.list.length - 1] || {};
        }
    },
    methods: {
        bindIo(){
            this.id = getId();
            this.io.emit('conn', this.id);
            this.io.on('conn', msg => {
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
        updateOrder(type){
            if(type == this.order) return;
            this.data.list = this.data.list.sort((a, b) => {
                return -1;
            })
            this.order = type;
        }
    },
    mounted(){
        let searchData = toObj(location.search);
        this.searchData = searchData;
        if(searchData.href && searchData.key){
            this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
            this.bindIo();

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
            })
        } else {
            this.errors.push('没有href/key参数');
        }
    }
})
}