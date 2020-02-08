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
		bookData: []
	},
	computed: {
		loadMax() {
			return Object.keys(this.checkOrigins).length;
		}
	},
	methods: {
		getBook() {
			if (this.isLoad) return;
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
					socketId: this.io && this.io.id
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
			this.io.on("searchResult", res => {
				this.loadNum++;
			});
			this.io.on("webPersonNumber", res => {
				this.personNumber = res;
			});
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
			window.open("/info.html?" + toStr(data));
		},
		getChapter(href, key, title, author) {
			let data = {
				href,
				key,
				bookTitle: title,
				author
			};

			window.open(`/chapter.html?${toStr(data)}`);
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
		this.bookData = getBookData();
	}
});
