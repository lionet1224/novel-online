import config from './config'
import {
	toObj,
	toStr,
  getSet,
  setSet,
	getId,
	getBookData,
	setBookData,
	addBookData,
	updateBookData,
  loadFont,
  bottomBarBind,
  userTestToken,
  getBookshelf,
  deleteBookshelf
} from './tool'
import '../style/bootstrap.css'
import '../style/style.css'
import '../style/checkbox.css'

window.onload = () => {
// loadFont();
new Vue({
    el: '#app',
    data: {
      getChapterListFlag: true,
      autoChapter: false,
      getChapterScrollTopFlag: false,

      fonts: [{
        name: '微软雅黑',
        font: '微软雅黑'
      }, {
        name: '思源黑体',
        font: '思源'
      }],
      font: '',
      debug: false
    },
    watch: {
      autoChapter(){
        this.storeSet();
      },
      getChapterListFlag(){
        this.storeSet();
      },
      font(){
        this.storeSet();
        loadFont(this.font);
      },
      debug(){
        this.storeSet();
      },
      getChapterScrollTopFlag(){
        this.storeSet();
      }
    },
    computed: {
        
    },
    methods: {
      loadSet(){
        // 加载配置
        let setData = getSet();
        this.autoChapter = setData.autoChapter;
        this.getChapterListFlag = setData.getChapterListFlag;
        this.font = setData.font || '微软雅黑';
        this.debug = setData.debug || false;
        this.getChapterScrollTopFlag = setData.getChapterScrollTopFlag || false;
      },
      storeSet(){
        setSet({
          autoChapter: this.autoChapter,
          getChapterListFlag: this.getChapterListFlag,
          font: this.font,
          debug: this.debug,
          getChapterScrollTopFlag: this.getChapterScrollTopFlag
        })
      },
    },
    mounted(){
        // this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
        // this.bindIo(() => {
        // });
        this.loadSet();
        
        bottomBarBind();
    }
})
}