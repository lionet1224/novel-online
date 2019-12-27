const search = require('./book/search')
const chapterList = require('./book/chapterList')
const chapter = require('./book/chapter')

module.exports = {
    searchBook: search,
    getBookChapterList: chapterList,
    getBookChapter: chapter
}