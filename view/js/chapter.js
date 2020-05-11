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

		fonts: [{
			name: '微软雅黑',
			font: '微软雅黑'
		}, {
			name: '思源黑体',
			font: '思源'
		}],
		font: '',

		href: null
	},
	watch: {
		autoChapter(){
			this.loadChapter();
			this.storeSet();
		},
		getChapterListFlag(){
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
				if(type == this.order || !this.chaptersData.list) return;
				this.chaptersData.list = this.chaptersData.list.reverse();
				this.order = type;
		},
		getChapter(href, isLoad = false) {
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
					}, 500);
					
					let lastChapter = false;
					!this.lastData.content && (lastChapter = true);

					// 添加到历史记录中
					updateBookData({
						title: this.lastData.title,
						href,
						bookTitle: this.searchData.bookTitle,
						author: this.searchData.author,
						origin: this.searchData.key,
						lastChapter
					});

					// 保存到服务器
					storeBookShelf(
						decodeURI(this.searchData.bookTitle),
						this.searchData.originHref,
						null,
						decodeURI(this.searchData.author),
						this.searchData.key,
						decodeURI(this.lastData.title),
						href
					).catch(err => {
						console.error(err.data.data.msg);
						if(this.debug){
							alert('保存浏览记录时发生错误: ' + err.data.data.msg);
						}
					})

					setTimeout(() => {
						this.loadChapter();
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
						href: this.href
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
				originHref: this.searchData.originHref
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
					if(this.chaptersData.list[i].title == this.lastData.title){
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
						null,
						this.searchData.author,
						this.searchData.key,
						this.lastData.title,
						this.href
					).then(res => {
						this.isStore = true;
					})
				}
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
				font: this.font
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
				this.getChapter(data.href);
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
		
		$('.screen').click(() => {
			$('.bar').fadeOut();
			$('body').removeClass('overflowHidden')
			let flag = $('.chapterBottom').hasClass('d-none');
			if(!flag){
				$('.chapterBottom').addClass('d-none');
				$('.addBookshelf').hide();
			}
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
			$('.bar .content').scrollTop(0)
		})

		$(document).scroll((ev) => {
			this.loadChapter();

			let flag = $('.chapterBottom').hasClass('d-none');
			if(!flag){
				$('.chapterBottom').addClass('d-none');
				$('.addBookshelf').hide();
			}
		})

		$(document).on('touchstart', (ev) => {
			this.touchTime && clearTimeout(this.touchTime)
			this.touchTime = setTimeout(() => {
				let width = $(document).width();
				if(width > 800) return;
				let height = document.documentElement.clientHeight || document.body.clientHeight;
				let offset = ev.changedTouches[0];
				if(offset.clientX > width / 2 - 100 && offset.clientX < width / 2 + 100 &&
					offset.clientY > height / 2 - 150 && offset.clientY < height / 2 + 150){
					this.isShowFlag = true;
				}
				
				setTimeout(() => {
					this.isShowFlag = false;
				}, 100)
			}, 50);
		})
		$(document).on('touchend', (ev) => {
			if(this.isShowFlag){
				setTimeout(() => {
					let flag = $('.chapterBottom').hasClass('d-none');
					if(flag){
						$('.chapterBottom').removeClass('d-none');
						$('.addBookshelf').show();
					} else {
						$('.chapterBottom').addClass('d-none');
						$('.addBookshelf').hide();
					}
				}, 0);
			}
		})

		// 判断是否登录
		userTestToken().then(res => {
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

		$('.menu-chapter-list-btn').click(() => {
			this.menuType = 'list';
			$('.menu-btn').click();

			this.toChapterPosition();
		})
		
		$('.manage-btn').click(() => {
			this.menuType = 'set';
			$('.menu-btn').click();
		})
	}
});
}