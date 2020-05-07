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
	for (let i = 0; i < local.length; i++) {
		let item = local[i];
		if (
			item.title == decodeURI(data.bookTitle) &&
			item.originkey == decodeURI(data.origin) &&
			item.author == decodeURI(data.author)
		) {
			item.chapterTitle = data.title;
            item.chapterHref = data.href;
            item.lastChapter = data.lastChapter;
			let old = local.splice(i, 1)[0];
			local.unshift(old);
			break;
		}
	}
	setBookData(local);
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
		getChapterListFlag: true
	};
	data = $.extend(init, data);
	setSet(data);
	return data;
}

function setSet(data){
	localStorage.setItem('userSet', JSON.stringify(data));
}