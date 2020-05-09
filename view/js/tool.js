function toObj(str) {
	let obj = {};
	let arr = str.slice(1).split("&");
	arr.map(k => {
		let v = k.split("=");
		obj[v[0]] = v[1];
	});
	return obj;
}

function toStr(obj) {
	let arr = [];
	Object.keys(obj).forEach(key => {
		arr.push(`${key}=${obj[key]}`);
	});
	return arr.join("&");
}

const bookDataKey = "bookDataKey";

function addBookData(data) {
	let local = getBookData();
	let flag = true;
	local.forEach(item => {
		if (item.title == data.title && item.originkey == data.originkey && item.author == data.author) {
			flag = false;
		}
	});
	if (flag) {
		data = {
			title: data.title,
			originkey: data.originkey,
			author: data.author,
			bookHref: data.bookHref
		};
		local.unshift(data);
		setBookData(local);
	}
}

function setBookData(data) {
	localStorage.setItem(bookDataKey, JSON.stringify(data));
}

function updateBookData(data) {
	let local = getBookData();
	let find = findBookData(data.bookTitle, data.author, data.origin);
	if(!find) return;
	find.item.chapterTitle = data.title;
	find.item.chapterHref = data.href;
	find.item.lastChapter = data.lastChapter;
	local.splice(find.i, 1)[0];
	local.unshift(find.item);
	setBookData(local);
}

function findBookData(title, author, origin){
	let local = getBookData();
	for (let i = 0; i < local.length; i++) {
		let item = local[i];
		if (
			item.title == decodeURI(title) &&
			item.originkey == decodeURI(origin) &&
			item.author == decodeURI(author)
		) {
			return {item, i};
		}
	}
}

function getBookData() {
	return JSON.parse(localStorage.getItem(bookDataKey) || "[]");
}

function getId(){
	let id = localStorage.getItem('socketId');
	if(!id){
		id = Math.random().toString(16).slice(2);
		localStorage.setItem('socketId', id);
	}
	return id;
}

function getSet(){
	let data = localStorage.getItem('userSet') || '{}';
	data = JSON.parse(data);
	let init = {
		autoChapter: false,
		getChapterListFlag: true,

		color: null,
		fontSize: 20,
		fontBottom: 16,
		fontIndent: 0
	};
	data = $.extend(init, data);
	setSet(data);
	return data;
}

function setSet(data){
	localStorage.setItem('userSet', JSON.stringify(data));
}

function loadFont(ele = '*', font = '思源') {
	var span = document.createElement("span");
	// 这几个字母和符号宽度比较容易变化
	span.innerHTML = "gW@i#Q!T";
	// 设置为不可见，但可以测量宽度
	span.className = 'testFamily'
	// span.style.visibility = "hidden";
	// 字体大小为e68a84e799bee5baa631333332613664 500px，如果宽度变化比较容易区分
	span.style.fontSize = "500px";
	// 设置字体
	span.style.fontFamily = font;
	// 添加到页面
	document.body.appendChild(span);
	// 获取宽度
	var width_now = span.offsetWidth;
	// 每 0.05 秒检查一次是否加载
	var interval_check = setInterval(function() {
			// 宽度变化，说明字体被加载
			if(span.offsetWidth != width_now) {
					clearInterval(interval_check);
					// 设置字体为
					$('head').append(`
						<style>
							${ele} {
								font-family: ${font}
							}
						</style>
					`);
					// ele.style.fontFamily = font;
					// 移除 span
					document.body.removeChild(span);
					span = null;
			}
	}, 50);
}

module.exports = {
	toObj,
	toStr,
	getSet,
	getId,
	getBookData,
	setBookData,
	addBookData,
	findBookData,
	updateBookData,
	setSet,
	loadFont
}