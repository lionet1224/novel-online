module.exports = {
    // biquge: {
    //     // 基础设置
    //     name: '笔趣阁',
    //     href: 'http://www.qbiqu.com',
    //     search: 'http://www.qbiqu.com/modules/article/search.php?searchkey={search}',
    //     code: 'gbk',
    //     device: 'pc',
    //     status: false,

    //     // 搜索dom获取
    //     searchCode: 'gbk',
    //     searchList: 'tbody>tr',
    //     searchIndex: 1,
    //     searchTitle: 'td/a/eq-0/text',
    //     searchHref: 'td/a/eq-0/attr-href',
    //     searchAuthor: 'td/eq-2/text',
    //     searchNewChapter: 'td/eq-1/text',
    //     searchUpdated: 'td/eq-4/text',

    //     // 详情页dom获取
    //     infoTitle: '#maininfo h1/text',
    //     infoAuthor: '#maininfo p/eq-0/text/allSpace/not-作者：',
    //     infoNewChapter: '#maininfo p/eq-3/text/not-最新章节：',
    //     infoUpdated: '#maininfo p/eq-2/text/not-最后更新：',
    //     infoImage: '#fmimg img/attr-src/addhref',
    //     infoDescription: '#intro p/eq-0/html/allSpace',
    //     infoChapterList: '#list dd',
    //     infoChapterIndex: 9,
    //     infoChapterTitle: 'a/text',
    //     infoChapterHref: 'a/attr-href/addhref',

    //     chapterTitle: 'h1/text',
    //     chapterContent: '#content/remove-div/html',
    //     chapterPrevHref: '.bottem2 a/eq-2/attr-href/addhref',
    //     chapterNextHref: '.bottem2 a/eq-4/attr-href/addhref'
    // },
    biququ: {
        name: '笔趣趣',
        href: 'http://www.biququ.info',
        search: 'http://www.biququ.info/search.php?keyword={search}',
        code: 'utf-8',
        status: true,

        searchCode: 'utf-8',
        searchList: '#search-main ul>li',
        searchIndex: 1,
        searchTitle: '.s2>a/text',
        searchHref: '.s2>a/attr-href',
        searchAuthor: '.s4/text',
        searchNewChapter: '.s3/text',
        searchUpdated: '.s6/text',
        
        // 详情页dom获取
        infoTitle: '#maininfo h1/text',
        infoAuthor: '#maininfo p/eq-0/text/allSpace/not-作者：',
        infoNewChapter: '#maininfo p/eq-3/text/not-最新更新：',
        infoUpdated: '#maininfo p/eq-1/text/not-最后更新：',
        infoImage: '#fmimg img/attr-src',
        infoDescription: '#intro/html/allSpace',
        infoChapterList: '#list dd',
        infoChapterIndex: 0,
        infoChapterTitle: 'a/text',
        infoChapterHref: 'a/attr-href/addhref',

        chapterTitle: 'h1/text',
        chapterContent: '#content/remove-div/html',
        chapterPrevHref: '#pager_prev/attr-href/addhref',
        chapterNextHref: '#pager_next/attr-href/addhref'
    },
    biquge5200: {
        name: '笔趣阁5200',
        href: 'https://www.biquge5200.cc',
        search: "https://www.biquge5200.cc/modules/article/search.php?searchkey={search}",
        code: 'gbk',
        device: 'pc',
        status: true,

        searchCode: 'utf-8',
        searchList: '.grid>tbody>tr',
        searchIndex: 1,
        searchTitle: 'td/eq-0/a/html',
        searchHref: 'td/eq-0/a/attr-href',
        searchAuthor: 'td/eq-2/text',
        searchNewChapter: 'td/eq-1/text',
        searchUpdated: 'td/eq-4/text',
        
        // 详情页dom获取
        infoTitle: '#maininfo h1/text',
        infoAuthor: '#maininfo p/eq-0/text/allSpace/not-作者：',
        infoNewChapter: 'dd/eq-0/text',
        infoUpdated: '#maininfo p/eq-2/text/not-最后更新：',
        infoImage: '#fmimg img/attr-src',
        infoDescription: '#intro/html/allSpace',
        infoChapterList: '#list dd',
        infoChapterIndex: 9,
        infoChapterTitle: 'a/text',
        infoChapterHref: 'a/attr-href',

        chapterTitle: 'h1/text',
        chapterContent: '#content/remove-div/html',
        chapterPrevHref: '.bottem1 a/eq-1/attr-href',
        chapterNextHref: '.bottem1 a/eq-3/attr-href'
    },
    quanxiaoshuo: {
        name: '全小说',
        href: 'https://qxs.la',
        search: 'https://qxs.la/s_${search}',
        code: 'gbk',
        status: true,
        
        searchCode: 'utf-8',
        searchList: '.main.list>ul.list_content',
        searchIndex: 0,
        searchTitle: '.cc2>a/text',
        searchHref: '.cc2>a/attr-href/addhref',
        searchAuthor: '.cc4>a/text',
        searchNewChapter: '.cc3/text',
        searchUpdated: '.cc5/text',

        infoTitle: 'h1 a/eq-0/text',
        infoAuthor: '.w2>a/text',
        infoNewChapter: '.w4>a/text',
        infoUpdated: '.w4/remove-a/text/not-最新章节：/not-（/not-）',
        infoImage: '',
        infoDescription: '.desc/html/allSpace/not-简介：',
        infoChapterList: '.chapters .chapter',
        infoChapterIndex: 0,
        infoChapterTitle: 'a/text',
        infoChapterHref: 'a/attr-href/addhref',

        chapterTitle: 'h1/text',
        chapterContent: '#content/remove-div/html',
        chapterPrevHref: '#prevLink/attr-href/addhref',
        chapterNextHref: '#nextLink/attr-href/addhref'
    }
}