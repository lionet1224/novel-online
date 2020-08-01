const { cheerio, iconv } = require("./quick");
const { toGBK, encode } = require("./tool");

class Dom {
	constructor(replite) {
		this.replite = replite;
	}

	load($) {
		this.$ = $;
		console.log($.html())
	}

	get(name, val = "") {
		return (this.replite && this.replite[name]) || val;
	}

	parse(dom, selector) {
		let arr = selector.split("/");
		let result = null;
		arr.map(item => {
			let arr = item.split("-");
			switch (arr[0]) {
				case "":
					break;
				case "html":
					result = result.html();
					break;
				case "text":
					result = result.text();
					break;
				case "attr":
					result = result.attr(arr[1]);
					break;
				case "eq":
					result = result.eq(arr[1]);
					break;
				case "addhref":
					result = result ? this.get("href") + result : "";
					break;
				case "not":
					result =
						typeof result == "string" ? result.replace(arr[1], "") : result;
					break;
				case "allSpace":
					result =
						typeof result == "string" ? result.replace(/\s/g, "") : result;
					break;
				case "remove":
					result.find(arr[1]).remove();
					break;
				default:
					result = dom.find(item);
					break;
			}
		});
		return result;
	}

	setHref(name) {
		let code = this.get("searchCode", this.get("code", "utf-8"));
		name = code.toLocaleUpperCase() == "GBK" ? toGBK(name) : encode(name);
		this.href = this.replite.search.replace("{search}", name);
		return this.href;
	}

	transform(body) {
		return cheerio.load(iconv.decode(body, this.get("code", "utf-8")), {
			decodeEntities: false
		});
	}

	getDom(dom, name) {
		dom = dom || this.$("body");
		return this.parse(dom, this.get(name));
	}

	getSearchList(path) {
		let list = [];
		if (path != this.href) {
			return [
				{
					title: this.getDom(null, "infoTitle"),
					href: path,
					author: this.getDom(null, "infoAuthor"),
					newChapter: this.getDom(null, "infoNewChapter"),
					updated: this.getDom(null, "infoUpdated"),
				}
			];
		} else {
			let searchList = this.$(this.get("searchList"));
			for (let i = this.get("searchIndex", 0); i < searchList.length; i++) {
				let item = searchList.eq(i);
				let data = {
					title: this.getDom(item, "searchTitle"),
					href: this.getDom(item, "searchHref"),
					author: this.getDom(item, "searchAuthor"),
					newChapter: this.getDom(item, "searchNewChapter"),
					updated: this.getDom(item, "searchUpdated"),
				};
				list.push(data);
			}
			return list;
		}
	}

	getChapterList() {
		let result = {
			title: this.getDom(null, "infoTitle"),
			author: this.getDom(null, "infoAuthor"),
			newChapter: this.getDom(null, "infoNewChapter"),
			updated: this.getDom(null, "infoUpdated"),
			imageUrl: this.getDom(null, "infoImage"),
			description: this.getDom(null, "infoDescription"),
			origin: this.replite.name
		};
		let list = [];
		let chapterList = this.$(this.get("infoChapterList"));
		for (let i = this.get("infoChapterIndex", 0); i < chapterList.length; i++) {
			let item = chapterList.eq(i);
			list.push({
				title: this.getDom(item, "infoChapterTitle"),
				href: this.getDom(item, "infoChapterHref")
			});
		}
		result.list = list;

		return result;
	}

	getChapter(uri) {
		let result = {
			title: this.getDom(null, "chapterTitle"),
			content: this.getDom(null, "chapterContent"),
			prevHref: this.getDom(null, "chapterPrevHref"),
			nextHref: this.getDom(null, "chapterNextHref"),
			currentHref: uri
			// chapterContentLength
		};
		return result;
	}
}

module.exports = Dom;
