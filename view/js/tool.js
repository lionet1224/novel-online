function toObj(str) {
	let obj = {};
	let arr = str.slice(1).split("&");
	arr.map(k => {
		let v = k.split("=");
		obj[v[0]] = decodeURI(v[1]);
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
	if(!find){
		if(data.bookTitle && data.origin && data.author && data.bookHref){
			addBookData({
				title: data.bookTitle,
				originkey: data.origin,
				author: data.author,
				bookHref: data.bookHref
			});
			updateBookData(data);
		}
		return;
	}
	find.item.chapterTitle = data.title || find.item.chapterTitle;
	find.item.chapterHref = data.href || find.item.chapterHref;
	find.item.lastChapter = data.lastChapter || find.item.lastChapter;
	find.item.chapterScrollTop = data.chapterScrollTop != undefined ? data.chapterScrollTop : find.item.chapterScrollTop;
	find.item.pagingNum = data.pagingNum != undefined ? data.pagingNum : find.item.pagingNum;
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
	let id = getCookie('socketId');
	if(!id){
		id = Math.random().toString(16).slice(2);
		setCookie('socketId', id);
	}
	return id;
}

function getSet(){
	let data = localStorage.getItem('userSet') || '{}';
	data = JSON.parse(data);
	let init = {
		autoChapter: false,
		getChapterListFlag: true,
		getChapterScrollTopFlag: false,

		color: null,
		fontSize: 20,
		fontBottom: 16,
		fontIndent: 0,

		font: '微软雅黑',

		debug: false,
		// scroll paging
		bookType: false
	};
	data = $.extend(init, data);
	// setSet(data);
	return data;
}

function setSet(data){
	let conf = getSet();
	conf = $.extend(conf, data);
	localStorage.setItem('userSet', JSON.stringify(conf));
}

function loadFont() {
	let conf = getSet();
	if(!conf.font) return;
	
	$('.fontSet').remove();
	$('head').append(`
		<style class="fontSet">
			* {
				font-family: ${conf.font}
			}
		</style>
	`);
}

function bottomBarBind(flag){
	$('#app').append(`
	<div class="bottomBar ${flag ? 'chapterBottom d-none' : ''}">
		<div class="items">
				<div class="item home-btn">
						<svg t="1589098298000" class="icon" viewBox="0 0 1032 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2196" fill="#666" width="40" height="40"><path d="M1032.005818 536.110545h-194.304v-46.545454h81.198546L564.386909 138.24a35.444364 35.444364 0 0 0-49.733818 0L160.116364 489.565091h81.105454v46.545454H47.034182L481.885091 105.169455a82.106182 82.106182 0 0 1 115.269818 0l434.850909 430.94109z" p-id="2197"></path><path d="M433.617455 933.399273h-138.333091a103.726545 103.726545 0 0 1-103.610182-103.610182V512.837818h46.545454v316.951273c0 31.488 25.6 57.064727 57.064728 57.064727h91.787636v-252.974545h46.545455v299.52zM783.755636 933.399273h-138.309818v-299.52h46.545455v252.974545h91.764363c31.488 0 57.064727-25.6 57.064728-57.064727V512.837818h46.545454v316.951273a103.726545 103.726545 0 0 1-103.610182 103.610182z" p-id="2198"></path><path d="M389.445818 631.552h299.752727v46.545455h-299.752727z" p-id="2199"></path></svg>
				</div>
				<div class="item bookshelf-btn">
						<svg t="1589098538995" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1430" fill="#666" width="40" height="40"><path d="M921.735 733.468v38.168s2.076 19.328-38.168 57.252c-47.984 45.662-549.786 61.141-648.851 0C135.652 767.744 101.13 542.63 101.13 542.63v-38.17H62.962v57.252s44.053 243.426 171.755 305.341c168.718 56.5 475.487 54.952 648.851 0 62.688-22.445 76.335-95.417 76.335-95.417v-38.168h-38.168z m-142.786 17.733c21.006 36.553 67.667 49.156 104.221 28.149 36.551-21.006 49.154-67.667 28.149-104.219l-152.14-264.739c-21.007-36.553-67.669-49.154-104.221-28.151-36.553 21.007-49.156 67.667-28.149 104.221l152.14 264.739z m-95.465-319.319c18.275-10.504 41.607-4.202 52.11 14.072l142.631 248.193c10.504 18.277 4.202 41.607-14.074 52.11-18.277 10.504-41.607 4.202-52.11-14.076L669.41 483.989c-10.504-18.275-4.202-41.607 14.074-52.107zM497.098 761.59c7.544 41.479 47.286 68.986 88.763 61.442 41.479-7.546 68.988-47.284 61.442-88.765l-102.455-563.27c-7.544-41.479-47.284-68.988-88.763-61.442-41.479 7.544-68.988 47.286-61.442 88.763L497.098 761.59z m-30.769-595.71c20.74-3.771 40.61 9.983 44.383 30.721L609.754 741.1c3.771 20.738-9.983 40.609-30.721 44.381-20.74 3.773-40.61-9.981-44.383-30.721l-99.041-544.496c-3.772-20.739 9.982-40.611 30.72-44.384zM311.05 809.801c42.16 0 76.337-34.177 76.337-76.333V160.951c0-42.158-34.177-76.335-76.337-76.335-42.158 0-76.333 34.177-76.333 76.335v572.517c-0.001 42.156 34.175 76.333 76.333 76.333z m-38.166-629.766c0-21.08 17.088-38.166 38.166-38.166 21.08 0 38.17 17.086 38.17 38.166v553.433c0 21.078-17.09 38.168-38.17 38.168-21.078 0-38.166-17.09-38.166-38.168V180.035z" p-id="1431"></path></svg>
				</div>
				<div class="item manage-btn">
						<svg t="1589178260792" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2226" width="40" height="40"><path d="M512 938.666667c-27.401481 0-54.897778-2.654815-81.635556-7.774815l-17.825185-3.413333 0.474074-18.10963c0.284444-9.386667-1.422222-18.488889-5.025185-27.306667-14.032593-33.848889-52.906667-49.967407-86.755555-35.934815-8.628148 3.602963-16.213333 8.722963-22.565926 15.36l-12.325926 13.084445-14.980741-10.24C226.702222 833.706667 188.586667 795.496296 158.340741 750.648889L148.195556 735.762963l12.989629-12.420741c6.637037-6.352593 11.851852-13.937778 15.36-22.565926 6.826667-16.402963 6.826667-34.417778 0-50.82074s-19.531852-29.108148-35.934815-35.934815c-8.533333-3.508148-17.445926-5.214815-26.548148-5.025185l-18.014815 0.284444-3.318518-17.635556c-4.93037-26.074074-7.395556-52.906667-7.395556-79.644444 0-27.117037 2.56-54.234074 7.585186-80.592593l3.413333-17.73037 18.014815 0.379259c9.197037 0.18963 18.204444-1.517037 26.737777-5.025185 16.402963-6.826667 29.108148-19.531852 35.934815-35.934815s6.826667-34.417778 0-50.82074c-3.508148-8.533333-8.628148-16.118519-15.265185-22.376297l-12.98963-12.515555 10.145186-14.885926c30.435556-44.752593 68.551111-82.962963 113.303703-113.398519l14.980741-10.145185 12.515556 13.084445c18.773333 19.721481 48.355556 25.979259 73.481481 15.549629 25.220741-10.42963 41.718519-35.745185 40.96-63.051852l-0.474074-18.109629L431.407407 92.918519c52.432593-10.05037 107.70963-10.145185 160.331852-0.18963l17.825185 3.413333-0.474074 18.204445c-0.758519 27.306667 15.739259 52.717037 40.96 63.146666 25.315556 10.524444 54.992593 4.171852 73.765926-15.834074l12.420741-13.179259 15.075556 10.24c44.847407 30.435556 82.962963 68.456296 113.493333 113.208889l10.24 14.980741-13.179259 12.515555c-6.826667 6.447407-12.041481 14.127407-15.644445 22.850371-6.826667 16.402963-6.826667 34.417778 0 50.82074s19.531852 29.108148 35.934815 35.934815c8.817778 3.602963 18.014815 5.30963 27.401482 5.025185l18.204444-0.568889L931.081481 431.407407c5.025185 26.358519 7.585185 53.57037 7.585186 80.592593 0 26.737778-2.465185 53.57037-7.395556 79.644444l-3.413333 17.92-18.204445-0.474074c-9.386667-0.284444-18.488889 1.422222-27.211852 5.025186-33.848889 14.032593-49.967407 52.906667-35.934814 86.755555 3.602963 8.722963 8.912593 16.497778 15.739259 22.945185l13.274074 12.420741-10.24 15.075556c-30.435556 44.847407-68.456296 82.962963-113.208889 113.493333l-14.980741 10.24-12.515555-13.179259c-6.447407-6.826667-14.127407-12.041481-22.755556-15.644445-16.402963-6.826667-34.417778-6.826667-50.82074 0-16.402963 6.826667-29.108148 19.531852-35.934815 35.934815-3.602963 8.817778-5.30963 18.014815-5.025185 27.401482l0.568888 18.204444-17.825185 3.413333c-26.548148 4.93037-53.665185 7.49037-80.782222 7.490371z m-57.268148-46.933334c37.546667 5.594074 76.231111 5.688889 113.682963 0.094815 1.327407-8.912593 3.697778-17.635556 7.205926-26.168889 11.188148-26.927407 32.142222-47.881481 58.974815-58.974815 26.927407-11.188148 56.50963-11.188148 83.437037 0 8.438519 3.508148 16.213333 7.86963 23.324444 13.274075 30.151111-22.471111 56.604444-49.019259 78.980741-79.170371-5.404444-7.205926-9.860741-15.075556-13.368889-23.608889-11.188148-26.927407-11.188148-56.50963 0-83.437037s32.142222-47.881481 58.974815-58.974815c8.438519-3.508148 17.066667-5.878519 25.884444-7.205926 2.654815-18.299259 3.982222-36.882963 3.982222-55.466666 0-18.868148-1.422222-37.736296-4.077037-56.32-8.912593-1.327407-17.635556-3.697778-26.168889-7.205926-26.927407-11.188148-47.881481-32.142222-58.974814-58.974815s-11.188148-56.50963 0-83.437037c3.508148-8.438519 7.86963-16.213333 13.274074-23.419259-22.471111-30.151111-49.019259-56.604444-79.170371-78.980741-12.325926 9.197037-26.453333 15.739259-41.623703 19.057778-21.997037 4.93037-44.562963 2.939259-65.422223-5.688889-20.764444-8.628148-38.21037-23.22963-50.251851-42.097778-8.343704-13.084444-13.748148-27.685926-15.928889-42.856296-36.977778-5.30963-74.998519-5.30963-111.881482 0.094815-2.275556 15.17037-7.68 29.677037-16.023704 42.761481-12.041481 18.868148-29.392593 33.46963-50.157037 42.097778-20.764444 8.628148-43.235556 10.619259-65.137777 5.783704-15.17037-3.318519-29.202963-9.765926-41.528889-18.868149-30.245926 22.471111-56.794074 49.019259-79.170371 79.265186 5.12 7.016296 9.386667 14.601481 12.8 22.755555 11.188148 26.927407 11.188148 56.50963 0 83.437037S184.225185 437.380741 157.392593 448.474074c-8.154074 3.413333-16.687407 5.783704-25.220741 7.111111-2.74963 18.678519-4.171852 37.546667-4.171852 56.50963 0 18.583704 1.327407 37.262222 3.982222 55.656296 8.533333 1.327407 16.877037 3.697778 25.031111 7.016296 26.927407 11.188148 47.881481 32.142222 58.974815 58.974815s11.188148 56.50963 0 83.437037c-3.413333 8.248889-7.774815 15.928889-12.989629 22.945185 22.376296 30.245926 48.82963 56.888889 78.98074 79.454815 7.016296-5.214815 14.696296-9.481481 22.945185-12.894815 55.561481-23.04 119.466667 3.508148 142.506667 58.974815 3.602963 8.533333 5.973333 17.256296 7.300741 26.074074z" p-id="2227" fill="#666"></path><path d="M512.474074 657.066667C432.734815 657.066667 367.881481 592.213333 367.881481 512.474074S432.734815 367.881481 512.474074 367.881481 657.066667 432.734815 657.066667 512.474074 592.213333 657.066667 512.474074 657.066667z m0-246.518519C456.248889 410.548148 410.548148 456.248889 410.548148 512.474074S456.248889 614.4 512.474074 614.4 614.4 568.699259 614.4 512.474074 568.699259 410.548148 512.474074 410.548148z" p-id="2228" fill="#2c2c2c"></path></svg>
				</div>
				${flag ? `
				<div class="item chapter-list-btn">
					<svg t="1589183337013" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3361" width="40" height="40"><path d="M170.666667 213.333333h682.666666v85.333334H170.666667V213.333333z m0 512h682.666666v85.333334H170.666667v-85.333334z m0-256h682.666666v85.333334H170.666667v-85.333334z" fill="#444444" p-id="3362"></path></svg>
				</div>
				` : ''}
		</div>
	</div>
	`).css('padding-bottom', '70px')
	function resize(){
		let width = $(document).width();
		if(width <= 800){
			$('.bottomBar').show();
			$('.addBookshelf').hide();
		} else {
			$('.bottomBar').hide();
			$('.addBookshelf').show();
		}
	}
	$(window).on('resize', () => {
		resize();
	})
	resize();

	$('.home-btn').click(() => {
		location.href = '/';
	})
	$('.bookshelf-btn').click(() => {
		let user = getCookie('userToken');
		if(user){
			location.href = '/bookshelf.html'
		} else {
			location.href = '/user.html?to=bookshelf&type=login'
		}
	})
	if(flag){
	} else {
		$('.manage-btn').click(() => {
			location.href = '/manage.html'
		})
	}

	if(location.pathname == '/'){
		$('.home-btn path').attr('fill', '#409EFF');
	}
	['bookshelf', 'manage'].map(item => {
		if(location.pathname.match(item)){
			$('.bottomBar path').attr('fill', '#666')
			$(`.${item}-btn path`).attr('fill', '#409EFF');
		}
	})
}

let $http = axios.create({
	baseURL: 'http://blog.lionet.top:3000/api/v1',
	// baseURL: 'http://127.0.0.1:8888/api/v1',
})
// $http.interceptors.response.use(res=>res, err => {

// 	console.log(err.response.data.data.code)
// })
function login(email, password){
	return $http.post('/user/login', {
		email, password
	})
}
function register(username, password, authCode, email){
	return $http.post(`/user`, {
		username,
		password,
		authCode,
		email
	})
}
function registerCode(email){
	// axios.post(`${api}/user/create/authcode`, {
	// 	email
	// }).then(res => {

	// })
	return $http.post('/user/create/authcode', {
		email
	})
}

function userTestToken(){
	let token = getCookie('userToken');
	return $http.get('/user/test', {
		auth: {
			username: token
		}
	})
}

function getBookshelf(){
	return $http.get('/bookshelf/list', {
		auth: {
			username: getCookie('userToken')
		}
	})
}
function findBookshelf(bookTitle, bookHref, author, origin){
	return $http.get('/bookshelf', {
		params: {
			bookTitle,
			bookHref,
			author,
			origin,
		},
		auth: {
			username: getCookie('userToken')
		}
	})
}
function deleteBookshelf(bookTitle, bookHref, author, origin){
	return $http.delete('/bookshelf', {
		data: {
			bookTitle,
			bookHref,
			author,
			origin,
		},
		auth: {
			username: getCookie('userToken')
		}
	})
}
function storeBookShelf(bookTitle, bookHref, bookImage, author, origin, chapterTitle = null, chapterHref = null){
	return $http.post('/bookshelf', {
		bookTitle,
		bookHref,
		bookImage,
		author,
		origin,
		chapterTitle,
		chapterHref
	}, {
		auth: {
			username: getCookie('userToken')
		}
	})
}

function setCookie(name, value){
    var Days = 365;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

//读取cookies
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
 
    if(arr=document.cookie.match(reg))
 
        return unescape(arr[2]);
    else
        return null;
}

//删除cookies
function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
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
	loadFont,
	bottomBarBind,

	register,
	registerCode,
	login,

	setCookie,
	getCookie,
	delCookie,

	userTestToken,
	getBookshelf,
	findBookshelf,
	storeBookShelf,
	deleteBookshelf
}