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
	bottomBarBind
} from './tool'
import '../style/bootstrap.css'
import '../style/style.css'

window.onload = () => {
let $http = axios;

new Vue({
	el: "#app",
	data: {
		bookTitle: "",
		prevTitle: "",
		origins: {},
		checkOrigins: [],
		data: {},
		items: [],
		isLoad: false,
		isShow: false,
		isRedis: false,
		io: null,
		loadNum: 0,
		personNumber: 0,
		bookData: [],

		isConn: false
	},
	computed: {
		loadMax() {
			return Object.keys(this.checkOrigins).length;
		}
	},
	methods: {
		getBook() {
			if (this.isLoad) return;

			if(!this.isConn){
				this.bindIo();
			}

			this.isShow = true;
			this.isLoad = true;
			this.isRedis = false;
			this.items = [];
			this.data = {};
			this.loadNum = 0;
			this.prevTitle = this.bookTitle;
			$http
				.post("book/search", {
					name: this.bookTitle,
					origins: this.checkOrigins,
					socketId: this.id
				})
				.then(res => {
					this.isLoad = false;
					this.data = res.data.data;
					this.isRedis = this.data.isRedis;
					this.addItem();
				});
		},
		addItem() {
			if (typeof this.data == "string" || !this.data.result) return;
			this.data.result.map(origin => {
				if (!origin.data) return;
				for (let i = 0; i < origin.data.length; i++) {
					let item = origin.data[i];
					if(item.title.replace(/\s*/, '') == '' &&
						item.author.replace(/\s*/, '') == '') return;
					item.origin = origin.origin;
					item.originKey = origin.originKey;
					(function(i, item, app) {
						setTimeout(() => {
							app.items.push(item);
						}, i * 50);
					})(i, item, this);
				}
			});
		},
		bindIo() {
			this.id = getId();
			this.io.emit('conn', this.id);
			this.io.on('conn', (msg) => {
				console.log(msg)
				this.isConn = true;
				this.io.on("searchResult", res => {
					this.loadNum++;
				});
				this.io.on("webPersonNumber", res => {
					this.personNumber = res;
				});
			})
		},
		deleteSearch() {
			$http
				.delete("book/search", {
					params: {
						title: this.prevTitle
					}
				})
				.then(res => {
					alert("删除成功");
					this.isRedis = false;
				});
		},
		searchAuthor(str) {
			this.bookTitle = str;
			this.getBook();
		},
		getChapterList(href, key) {
			let data = {
				href,
				key
			};
			return "/info.html?" + toStr(data);
		},
		getChapter(href, key, title, author, originHref) {
			let data = {
				href,
				key,
				bookTitle: title,
				author,
				originHref
			};

			return `/chapter.html?${toStr(data)}`
		},
		deleteBookData(index){
				let data = getBookData();
				data.splice(index, 1);
				setBookData(data);
				this.bookData = data;
				alert('删除成功');
		}
	},
	mounted() {
		$http.get("origin").then(res => {
			res = res.data;
			this.origins = res.data;
			this.checkOrigins = Object.keys(this.origins);
		});

		this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
		this.bindIo();

		// 展示历史记录
		let bookData = getBookData();
		bookData.map((val, i) => {
			setTimeout(() => {
				this.bookData.push(val);
			}, i * 100);
		})

		loadFont();

		bottomBarBind();
	}
});
}