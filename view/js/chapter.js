new Vue({
	el: "#app",
	data: {
		errors: [],
		infos: [],
		data: [],
		key: "",

		menuType: 'list',
		listError: false,
		
		order: 'asc',
		chaptersData: {},
		loadChapterList: true,

		autoChapter: false,
		autoChapterFlag: false,
		getChapterListFlag: true
	},
	watch: {
		autoChapter(){
			this.loadChapter();
			this.storeSet();
		},
		getChapterListFlag(){
			this.storeSet();
		}
	},
	computed: {
		prevHref() {
			return (
				"/chapter.html?" +
				toStr({
					href: this.lastData.prevHref,
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
					href: this.lastData.nextHref,
					key: this.key,
					bookTitle: this.searchData.bookTitle,
					author: this.searchData.author,
				})
			);
		},
		lastData(){
			return this.data[this.data.length - 1] || {};
		}
	},
	methods: {
		getChapterContentLength(i){
			return (
				this.data[i].content && this.data[i].content.replace(/[\w|\<|\>]/g, "").length
			)
		},
		bindIo() {
			this.io.emit('conn', this.id);
			this.io.on('conn', (msg) => {
				console.log(msg)
				this.io.on("infoMsg", res => {
					this.infos.push(res);
				});
				this.io.on("errorsMsg", msg => {
					this.errors.push(msg);
				});
			})
		},
		updateMenuType(type){
			if(type == this.menuType) return;
			this.menuType = type;

			if(type == 'list' && !this.chaptersData.list){
				this.refreshList();
			}
		},
		updateOrder(type){
				if(type == this.order) return;
				this.chaptersData.list = this.chaptersData.list.sort((a, b) => {
						return -1;
				})
				this.order = type;
		},
		getChapter(href, isLoad = false) {
			if(this.autoChapterFlag) return;
			let data = {
				href,
				origin: this.key
			};
			data.socketId = this.id;

			if(isLoad){
				this.autoChapterFlag = true;
			}

			axios
				.get("chapter", {
					params: data
				})
				.then(res => {
					if(isLoad){
						this.autoChapterFlag = false;
					}
					let data = res.data;
					this.data.push(data.data);
					document.title = this.lastData.title + " - lionet";
					setTimeout(() => {
						this.infos = [];
					}, 500);
					
					let lastChapter = false;
					!this.lastData.content && (lastChapter = true);

					// 添加到历史记录中
					updateBookData({
						title: this.data.title,
						href,
						bookTitle: this.searchData.bookTitle,
						author: this.searchData.author,
                        origin: this.searchData.key,
                        lastChapter
					});

					if(!this.lastData.content) return;

					// 检查文章是否由p标签组成
					let flag = this.lastData.content.match(/<(\/)?p>/g);
					// 不足10个就改造
					if((!flag || flag.length < 10)){
						let content = this.lastData.content.split(/(\r)|(<br(\/)?>)/ig).filter(i => {
							return i && i.replace(/\s*/, '') != '' && i != '<br>' && i != '<br/>';
						}).map(i => `<p>${i}</p>`).join('');
						this.lastData.content = content;
					}
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
		},
		getChapterList(cache = 'true'){
			if(!this.searchData.originHref){
				this.listError = true;
				return;
			}
			axios.get('chapter/list', {
					params: {
							href: this.searchData.originHref,
							origin: this.searchData.key,
							socketId: this.id,
							cache
					}
			}).then(res => {
				let data = res.data.data;
				this.chaptersData = data;
				this.loadChapterList = false;
			})
		},
		getChapterHref(href){
			let data = {
					href,
					key: this.searchData.key,
					bookTitle: this.searchData.bookTitle,
					author: this.searchData.author,
					originHref: this.searchData.originHref
			}

			return `/chapter.html?${toStr(data)}`;
		},
		refreshList(){
			if(!this.getChapterListFlag) return;
			this.chaptersData = {};
			this.loadChapterList = true;
			this.getChapterList('false');
		},
		toChapterPosition(){
			if(this.chaptersData.list && this.data.title){
				let index = -1;
				for(let i = 0; i < this.chaptersData.list.length; i++){
					if(this.chaptersData.list[i].title == this.data.title){
						index = i;
						break;
					}
				}
				let elem = $(`#chapter-list-id-${index}`);
				$('.bar .content').scrollTop(0)
				$('.bar .content').animate({
					scrollTop: elem.offset() ? elem.offset().top - 50 : 0,
				})
			}
		},

		loadSet(){
			// 加载配置
			let setData = getSet();
			this.autoChapter = setData.autoChapter;
			this.getChapterListFlag = setData.getChapterListFlag;
		},
		storeSet(){
			setSet({
				autoChapter: this.autoChapter,
				getChapterListFlag: this.getChapterListFlag
			})
		},
		loadChapter(){
			if(!this.autoChapter) return;
			let top = $(document).scrollTop();
			let end = $('.chapter').height();
			let height = document.documentElement.clientHeight || document.body.clientHeight;
			// 距离一屏幕
			if(top > end - height - 500 && this.lastData.nextHref){
				this.loadTime && clearTimeout(this.loadTime);
				this.loadTime = setTimeout(() => {
					this.getChapter(this.lastData.nextHref, true);
				}, 100);
			}
		}
	},
	mounted() {
		this.id = getId();
		let data = toObj(location.search);
		this.searchData = data;
		this.loadSet();
		if (data.href && data.key) {
			this.key = data.key;
			this.href = data.href;
			this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
			this.bindIo();

			this.getChapter(data.href);
			if(this.getChapterListFlag){
				this.getChapterList();
			}
		} else {
			this.errors.push("没有href/key参数");
		}

		$('.menu-btn').click(() => {
			$('.bar').show();
			$('body').css('overflow', 'hidden')
		})
		
		$('.screen').click(() => {
			$('.bar').fadeOut();
			$('body').css('overflow', 'visible')
		})
		
		$('.top').click(() => {
			$('.bar .content').scrollTop(0)
		})

		$(document).scroll((ev) => {
			this.loadChapter();
		})
		this.loadChapter();
	}
});