import config from './config'
import {
	toObj,
	toStr,
	getSet,
	getId,
	updateBookData,
	setSet,
	getBookData,
	findBookData,
	loadFont,
	storeBookShelf,
	bottomBarBind,
	deleteBookshelf,
	userTestToken,
	findBookshelf
} from './tool'
import '../style/bootstrap.css'
import '../style/style.css'
import '../style/checkbox.css'

window.onload = () => {
new Vue({
	el: "#app",
	data: {
		errors: [],
		infos: [],
		data: [],
		dataIndex: null,
		key: "",

		menuType: 'list',
		listError: false,
		
		order: 'asc',
		chaptersData: {},
		loadChapterList: true,

		isStore: false,

		autoChapter: false,
		autoChapterFlag: false,
		getChapterListFlag: false,
		fontSize: 20,
		fontBottom: 16,
		fontIndent: 0,
		getChapterScrollTopFlag: false,

		colors: [
			{bg: 'rgba(255, 255, 255,.8)'},
			{bg: 'rgba(250,245,234,.8)'},
			{bg: 'rgba(245,234,203,.8)'},
			{bg: 'rgba(230,242,229,.8)'},
			{bg: 'rgba(228,241,244,.8)'},
			{bg: 'rgba(245,228,227,.8)'},
			{bg: 'rgba(224,224,223,.8)'},
			{bg: 'rgba(25,27,27,.8)', font: 'white'}
		],
		color: null,
		debug: false,
		bookType: false,

		fonts: [{
			name: '微软雅黑',
			font: '微软雅黑'
		}, {
			name: '思源黑体',
			font: '思源'
		}],
		font: '',

		href: null,

		isLogin: false,

		pagingNum: 0,
		pagingMaxNum: 0,
	},
	watch: {
		autoChapter(){
			this.loadChapter();
			this.storeSet();
		},
		getChapterListFlag(){
			this.storeSet();
		},
		getChapterScrollTopFlag(){
			this.storeSet();
		},
		color(){
			$('body').css('background-color', this.color.bg);
			$('#app .container').css('color', this.color.font || '#212529')
			this.storeSet();
		},
		fontSize(){
			$('#app .container .content').css('font-size', this.fontSize + 'px');
			this.storeSet();
		},
		fontBottom(){
			this.setFontBottom();
			this.storeSet();
		},
		fontIndent(){
			this.setFontIndent();
			this.storeSet();
		},
		debug(){
			this.storeSet();
		},
		font(){
			this.storeSet();
			loadFont(this.font);
		},
		bookType(){
			if(this.bookType){
				$('.chapter').addClass('paging');
			} else {
				this.pagingNum = 0;
				this.pageLeft();
				$('.chapter').removeClass('paging');
			}
			this.storeSet();
			this.getMaxPaging();
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
					originHref: this.searchData.originHref
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
					originHref: this.searchData.originHref
				})
			);
		},

		lastData(){
			return this.data[this.data.length - 1] || {};
		},
		currentData(){
			return this.data[this.dataIndex] || null;
		}
	},
	methods: {
		setFontBottom(){
			$('#app .container .content *').css('margin-bottom', this.fontBottom + 'px');
		},
		setFontIndent(){
			$('#app .container .content *').css('text-indent', this.fontIndent * this.fontSize + 'px');
		},
		getChapterContentLength(i){
			return (
				this.data[i].content && this.data[i].content.replace(/[\w|\<|\>]/g, "").length
			)
		},
		bindIo(fn) {
			this.io.emit('conn', this.id);
			this.io.on('conn', (msg) => {
				console.log(msg)
				fn.call(this);
				this.io.on("infoMsg", res => {
					if(!this.bookType){
						this.infos.push(res);
					}
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
				if(type == this.order || !this.chaptersData.list) return;
				this.chaptersData.list = this.chaptersData.list.reverse();
				this.order = type;
		},
		getMaxPaging(fn){
			setTimeout(() => {
				let offset = $('.chapter .content p:last-child').offset();
				if(!offset) return;
				this.pagingMaxNum = Math.ceil(offset.left / $('.wrapper').width());
				this.currentData.paging = this.pagingMaxNum;
				fn && fn();
			}, 0);
		},
		getChapter(href, isLoad = false, fn) {
			if(this.autoChapterFlag) return;
			let data = {
				href,
				origin: this.key
			};
			data.socketId = this.id;
			this.href = href;

			if(isLoad){
				this.autoChapterFlag = true;
			}

			axios
				.get("chapter", {
					params: data
				})
				.then(res => {
					if(isLoad){
						setTimeout(() => {
							this.autoChapterFlag = false;
						}, 1000);
					}
					let data = res.data;
					this.data.push(data.data);
					document.title = this.lastData.title + " - lionet";
					setTimeout(() => {
						this.infos = [];

						fn && fn();
					}, 500);

					this.dataIndex = this.data.length - 1;
					setTimeout(() => {
						this.getMaxPaging();
						this.pageLeft.call(this, 0);
					}, 0);
					
					let lastChapter = false;
					!this.lastData.content && (lastChapter = true);

					// 添加到历史记录中
					updateBookData({
						title: this.lastData.title,
						href,
						bookTitle: this.searchData.bookTitle,
						author: this.searchData.author,
						origin: this.searchData.key,
						bookHref: this.searchData.originHref,
						lastChapter
					});

					// 保存到服务器
					if(this.isLogin){
						storeBookShelf(
							decodeURI(this.searchData.bookTitle),
							this.searchData.originHref,
							null,
							decodeURI(this.searchData.author),
							this.searchData.key,
							decodeURI(this.lastData.title),
							href
						).catch(err => {
							console.error(err.response.data.msg);
							if(this.debug){
								alert('保存浏览记录时发生错误: ' + err.response.data.msg);
							}
						})
					}

					setTimeout(() => {
						// this.loadChapter();
						this.setFontBottom();
						this.setFontIndent();
					}, 0);

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
						href: this.currentData.currentHref
					}
				})
				.then(res => {
					alert("删除成功");
				});
		},
		getChapterList(cache = 'true'){
			if(!this.getChapterListFlag) return;
			this.loadChapterList = true;
			if(!this.searchData.originHref){
				this.listError = true;
				this.loadChapterList = false;
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
				originHref: this.searchData.originHref,
				image: this.searchData.image
			}

			return `/chapter.html?${toStr(data)}`;
		},
		getChapterHrefClick(href, title){
			updateBookData({
				title,
				href,
				bookTitle: this.searchData.bookTitle,
				author: this.searchData.author,
				origin: this.searchData.key,
				chapterScrollTop: 0,
				pagingNum: 0
			});
		},
		refreshList(){
			if(!this.getChapterListFlag) return;
			this.chaptersData = {};
			this.loadChapterList = true;
			this.getChapterList('false');
		},
		toChapterPosition(){
			if(this.chaptersData.list && this.lastData.title){
				let index = -1;
				for(let i = 0; i < this.chaptersData.list.length; i++){
					if(this.chaptersData.list[i].href == this.href){
						index = i;
						break;
					}
				}
				let elem = $(`#chapter-list-id-${index}`);
				$('.bar .content').animate({
					scrollTop: elem.offset() ? elem.offset().top - 150 - $(document).scrollTop() : 0,
				})
			}
		},
		addBookshelf(){
			if(!this.isLogin){
				location.href = '/user.html?type=login&to=back';
				return;
			}
			if(this.isStore){
					deleteBookshelf(
						this.searchData.bookTitle, 
						this.searchData.originHref,
						this.searchData.author,
						this.searchData.key
					).then(res => {
						this.isStore = false;
					})
			} else {
				storeBookShelf(
					this.searchData.bookTitle, 
					this.searchData.originHref,
					this.searchData.image || null,
					this.searchData.author,
					this.searchData.key,
					this.lastData.title,
					this.href
				).then(res => {
					this.isStore = true;
				})
			}
		},

		getBookHref(){
			return `/info.html?` + toStr({
				href: this.searchData.originHref,
				key: this.searchData.key
			})
		},

		loadSet(){
			// 加载配置
			let setData = getSet();
			this.autoChapter = setData.autoChapter;
			this.getChapterListFlag = setData.getChapterListFlag;
			this.color = setData.color || this.colors[0];
			this.fontSize = setData.fontSize || this.fontSize;
			this.fontBottom = setData.fontBottom || this.fontBottom;
			this.fontIndent = setData.fontIndent || this.fontIndent;
			this.debug = setData.debug || false;
			this.font = setData.font || '微软雅黑';
			this.getChapterScrollTopFlag = setData.getChapterScrollTopFlag || false;
			this.bookType = setData.bookType || false;

			let width = document.documentElement.clientWidth || document.body.clientWidth;
			if(width >= 800){
				this.bookType = false;
			}
		},
		storeSet(){
			setSet({
				autoChapter: this.autoChapter,
				getChapterListFlag: this.getChapterListFlag,
				color: this.color,
				fontSize: this.fontSize,
				fontBottom: this.fontBottom,
				fontIndent: this.fontIndent,
				debug: this.debug,
				font: this.font,
				getChapterScrollTopFlag: this.getChapterScrollTopFlag,
				bookType: this.bookType
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
		},
		pageLeft(left = 0, anim = 0){
			$('.paging .wrapper').css({
				'transform': `translateX(calc(${this.pagingNum * 100}vw - ${this.pagingNum * (14)}px + ${left}px))`,
				'transition': anim + 's'
			})
		}
	},
	mounted() {
		this.id = getId();
		let data = toObj(location.search);
		this.searchData = data;
		let find = findBookData(data.bookTitle, data.author, data.key);
		// 章节数据使用本地存储中的
		if(find && find.item.chapterHref && find.item.chapterHref != data.href){
			this.searchData.href = find.item.chapterHref;
			location.search = `?` + toStr(this.searchData);
			return;
		}

		this.loadSet();
		loadFont();
		if (data.href && data.key) {
			this.key = data.key;
			this.href = data.href;
			this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
			this.bindIo(() => {
				this.getChapter(data.href, false, () => {
					if(this.getChapterScrollTopFlag){
						if(!this.bookType){
							setTimeout(() => {
								$('html, body').animate({
									scrollTop: find.item.chapterScrollTop || 0
								})
							}, 0);
						} else {
							setTimeout(() => {
								this.pagingNum = find.item.pagingNum || 0;
								this.pageLeft(0, .3);
							}, 0);
						}
					}
				});
				this.getChapterList();
			});
		} else {
			this.errors.push("没有href/key参数");
		}

		$('.menu-btn').click(() => {
			$('.bar').show();
			$('body').addClass('overflowHidden')
			$('.top').click();
		})
		
		function hideBar(){
			$('.bar').fadeOut();
			$('body').removeClass('overflowHidden')
			let flag = $('.chapterBottom').hasClass('d-none');
			if(!flag){
				$('.chapterBottom').addClass('d-none');
				$('.addBookshelf').hide();
			}
		}
		$('.screen').click(() => {
			hideBar();
		})
		$('.hiddenBar').click(() => {
			if(this.menuType == 'set') return;
			hideBar();
		})
		
		$('.bar .content').scroll(() => {
			let top = $('.bar .content').scrollTop();
			if(top >= 500){
					$('.top').show();
			} else {
					$('.top').hide();
			}
		})
		$('.top').click(() => {
			if(this.menuType == 'set') return;
			$('.bar .content').scrollTop(0)
		})

		function hideBottom(){
			let flag = $('.chapterBottom').hasClass('d-none');
			if(!flag){
				$('.chapterBottom').addClass('d-none');
				$('.addBookshelf').hide();
			}
		}

		$(document).scroll((ev) => {
			if(this.bookType) return;
			this.loadChapter();

			hideBottom();

			let top = $(document).scrollTop() - $('#book-title-' + (this.data.length - 1)).offset().top + 25;
			updateBookData({
				chapterScrollTop: top,
				bookTitle: this.searchData.bookTitle,
				author: this.searchData.author,
				origin: this.searchData.key
			})
		})

		// 判断是否登录
		userTestToken().then(res => {
			this.isLogin = true;
			findBookshelf(
					decodeURI(this.searchData.bookTitle),
					this.searchData.originHref,
					decodeURI(this.searchData.author),
					this.searchData.key,
			).then(res => {
					this.isStore = res.data.data.flag;
			})
		})

		bottomBarBind(true);

		$('#app').css('padding-bottom', '0')

		$('.menu-chapter-list-btn').click(() => {
			this.menuType = 'list';
			$('.menu-btn').click();

			this.toChapterPosition();
		})
		
		$('.manage-btn').click(() => {
			this.menuType = 'set';
			$('.menu-btn').click();
		})
		
		$('.chapter').on('click', ev => {
			let width = $(document).width();
			if(width > 800) return;
			let height = document.documentElement.clientHeight || document.body.clientHeight;
			if(ev.clientX > width / 2 - 100 && ev.clientX < width / 2 + 100 &&
				ev.clientY > height / 2 - 150 && ev.clientY < height / 2 + 150){
				let flag = $('.chapterBottom').hasClass('d-none');
				if(flag){
					$('.chapterBottom').removeClass('d-none');
					$('.addBookshelf').show();
				} else {
					$('.chapterBottom').addClass('d-none');
					$('.addBookshelf').hide();
				}
			}

			if(!this.bookType) return;
			if(ev.clientX >= width / 2 + 100) {
				if(Math.abs(this.pagingNum) >= this.pagingMaxNum && !this.data[this.dataIndex + 1]) return;
				this.pagingNum -= 1;
				touchEnd.call(this);
			}
			if(ev.clientX <= width / 2 - 100){
				if(this.pagingNum + 1 > 0 && !this.data[this.dataIndex - 1]) return;
				this.pagingNum += 1;
				touchEnd.call(this);
			}
		})

		let touchOffset = {};
		let touchFlag = false;
		let touchT = true;
		$('.chapter').on('touchstart', (ev) => {
			if(!this.bookType) return;
			touchFlag = true;
			touchOffset = ev.changedTouches[0];
			setTimeout(() => {
				touchFlag = false;
			}, 1500);
		})
		.on('touchmove', (ev) => {
			if(!this.bookType) return;
			let left = ev.changedTouches[0].clientX - touchOffset.clientX;
			if(this.pagingNum >= 0 && left >= 0 && !this.data[this.dataIndex - 1]){
				touchT = false;
				return;
			}
			// if(Math.abs(this.pagingNum) + 1 >= this.pagingMaxNum && left <= 0 && !this.data[this.dataIndex + 1]) {
			// 	touchT = false;
			// 	return;
			// }
			this.pageLeft.call(this, left);
		})
		.on('touchend', ev => {
			if(!this.bookType) return;
			let left = ev.changedTouches[0].clientX - touchOffset.clientX;
			if(((Math.abs(left) >= 20 && touchFlag) || Math.abs(left) >= $('.wrapper').width() / 2) && touchT){
				this.pagingNum += left > 0 ? 1 : -1;
				// if(this.pagingNum >= 0) this.pagingNum = 0;
				// if(Math.abs(this.pagingNum) + 1 >= this.pagingMaxNum) {
				// 	this.pagingNum = -this.pagingMaxNum + 1;
				// 	// this.getChapter(this.lastData.nextHref, true);
				// }
				touchEnd.call(this);
			} else {
				this.pageLeft.call(this, 0, .3);
			}
		})

		function storePaging(){
			updateBookData({
				pagingNum: this.pagingNum,
				bookTitle: this.searchData.bookTitle,
				author: this.searchData.author,
				origin: this.searchData.key
			})
		}

		function loadContent(num = 0){
			$('.chapter').hide();
			setTimeout(() => {
				this.setFontBottom();
				this.setFontIndent();
				this.pagingNum = num;
				storePaging.call(this);
				this.pagingMaxNum = this.currentData.paging;
				this.pageLeft.call(this, 0);
			}, 0);
			setTimeout(() => {
				$('.chapter').fadeIn();
			}, 100);
		}

		function touchEnd(){
			let anim = .3;
			hideBottom();
			if(this.pagingNum >= 1) {
				this.dataIndex -= 1;
				updateBookData({
					pagingNum: this.pagingNum,
					bookTitle: this.searchData.bookTitle,
					author: this.searchData.author,
					origin: this.searchData.key,
					title: this.currentData.title,
					href: this.currentData.currentHref
				})
				loadContent.call(this, -this.currentData.paging + 1);
				return;
			}
			if(Math.abs(this.pagingNum) >= this.pagingMaxNum){
				this.pagingNum = 0;
				if(this.data[this.dataIndex + 1]){
					this.dataIndex += 1;
					loadContent.call(this);
					return;
				} else {
					this.dataIndex += 1;
					this.pagingMaxNum = 0;
					this.getChapter(this.lastData.nextHref, true);
				}
				anim = 0;
			}
			storePaging.call(this);
			this.pageLeft.call(this, 0, anim);
		}
	}
});
}