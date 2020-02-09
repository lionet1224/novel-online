new Vue({
	el: "#app",
	data: {
		errors: [],
		infos: [],
		data: {},
		key: ""
	},
	computed: {
		prevHref() {
			return (
				"/chapter.html?" +
				toStr({
					href: this.data.prevHref,
					key: this.key,
					bookTitle: this.searchData.bookTitle,
					author: this.searchData.author,
				})
			);
		},
		nextHref() {
			return (
				"/chapter.html?" +
				toStr({
					href: this.data.nextHref,
					key: this.key,
					bookTitle: this.searchData.bookTitle,
					author: this.searchData.author,
				})
			);
		},
		chapterContentLength() {
			return (
				this.data.content && this.data.content.replace(/[\w|\<|\>]/g, "").length
			);
		}
	},
	methods: {
		bindIo() {
			this.io.on("infoMsg", res => {
				this.infos.push(res);
			});
			this.io.on("errorsMsg", msg => {
				this.errors.push(msg);
			});
		},
		getChapter(href) {
			let data = {
				href,
				origin: this.key
			};
			data.socketId = this.io.id;
			this.data = {};

			axios
				.get("chapter", {
					params: data
				})
				.then(res => {
					let data = res.data;
					this.data = data.data;
					document.title = this.data.title + " - lionet";
					setTimeout(() => {
						this.infos = [];
                    }, 500);
                    
                    let lastChapter = false;
                    !this.data.content && (lastChapter = true);

					// 添加到历史记录中
					updateBookData({
						title: this.data.title,
						href,
						bookTitle: this.searchData.bookTitle,
						author: this.searchData.author,
                        origin: this.searchData.key,
                        lastChapter
					});
				});
		},
		clearChapter() {
			axios
				.delete("chapter", {
					params: {
						href: this.href
					}
				})
				.then(res => {
					alert("删除成功");
				});
		}
	},
	mounted() {
		let data = toObj(location.search);
		this.searchData = data;
		if (data.href && data.key) {
			this.key = data.key;
			this.href = data.href;
			this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
			this.bindIo();

			this.io.on("connect", res => {
				this.getChapter(data.href);
			});
		} else {
			this.errors.push("没有href/key参数");
		}
	}
});
