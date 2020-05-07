const { searchBook, getBookChapterList, getBookChapter } = require('../scripts')
const { toJson, redis } = require(global.ROOTPATH + '/common')
const { origin } = require(global.ROOTPATH + '/config')

const Router = require('koa-router')
const router = new Router();

router.get('/', (ctx, next) => {
    ctx.response.body = 'hello world'
})

router.get('/origin', (ctx, next) => {
    ctx.body = toJson(origin, 'success');
})

router.post('/book/search', async (ctx, next) => {
    let data = ctx.request.body;
    let result = await searchBook(data.name, data.origins, data.socketId);
    ctx.body = toJson(result, 'success');
})

router.delete('/book/search', async (ctx, next) => {
    let title = ctx.request.query.title;
    await redis.del('data', `search-${title}`);
    ctx.body = toJson(null, 'success');
})

router.get('/chapter/list', async (ctx, next) => {
    let data = ctx.request.query;
    let result = await getBookChapterList(data.href, data.origin, data.socketId, data.cache);
    ctx.body = toJson(result, 'success');
})

router.get('/chapter', async (ctx, next) => {
    let data = ctx.request.query;
    let result = await getBookChapter(data.href, data.origin, data.socketId);
    ctx.body = toJson(result, 'success');
})

router.delete('/chapter', async (ctx, next) => {
    let href = ctx.request.query.href;
    await redis.del('data', `chapter-${href}`);
    ctx.body = toJson(null, 'success');
})

module.exports = router;